import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const CAISO_BASE_URL = "https://www.caiso.com/outlook/current";
const OUTPUT_PATH = path.resolve("assets/data/electricity-desk.json");
const REQUEST_TIMEOUT_MS = 20_000;

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && quoted && next === '"') {
      value += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(value.trim());
      value = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(value.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }

  if (value || row.length) {
    row.push(value.trim());
    if (row.some(Boolean)) rows.push(row);
  }

  const [headers, ...data] = rows;
  return data.map((values) => Object.fromEntries(
    headers.map((header, index) => [header, values[index] ?? ""]),
  ));
}

function numeric(value) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(String(value).replaceAll(",", ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function positive(value) {
  return Math.max(0, numeric(value) ?? 0);
}

function latestRow(rows, requiredField) {
  return rows.findLast((row) => numeric(row[requiredField]) !== null);
}

function pacificClockMinutes(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return Number(values.hour) * 60 + Number(values.minute);
}

function sourceTimestamp(time, now = new Date()) {
  const [hours, minutes] = time.split(":").map(Number);
  const intervalMinutes = hours * 60 + minutes;
  const elapsedMinutes = (pacificClockMinutes(now) - intervalMinutes + 1440) % 1440;
  return new Date(now.getTime() - elapsedMinutes * 60_000).toISOString();
}

async function fetchCsv(filename) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${CAISO_BASE_URL}/${filename}?_=${Date.now()}`, {
      headers: { "User-Agent": "Ana-Santasheva-Electricity-Desk/1.0" },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`${filename} returned HTTP ${response.status}`);
    return {
      rows: parseCsv(await response.text()),
      lastModified: response.headers.get("last-modified"),
    };
  } finally {
    clearTimeout(timeout);
  }
}

function mixEntry(label, value, total) {
  return {
    label,
    mw: Math.round(value),
    share: total > 0 ? Number(((value / total) * 100).toFixed(1)) : 0,
  };
}

async function buildSnapshot() {
  const [demandFeed, fuelFeed] = await Promise.all([
    fetchCsv("demand.csv"),
    fetchCsv("fuelsource.csv"),
  ]);
  const demandRows = demandFeed.rows;
  const fuelRows = fuelFeed.rows;

  const demand = latestRow(demandRows, "Current demand");
  if (!demand) throw new Error("CAISO demand feed contained no current demand value");

  const fuelsAtDemandTime = fuelRows.find((row) => row.Time === demand.Time);
  const fuels = fuelsAtDemandTime ?? latestRow(fuelRows, "Natural Gas");
  if (!fuels) throw new Error("CAISO fuel source feed contained no current values");

  const demandMw = numeric(demand["Current demand"]);
  const currentIndex = demandRows.indexOf(demand);
  const earlierDemand = currentIndex >= 12
    ? numeric(demandRows[currentIndex - 12]?.["Current demand"])
    : null;
  const solarMw = positive(fuels.Solar);
  const windMw = positive(fuels.Wind);
  const batteryMw = numeric(fuels.Batteries) ?? 0;
  const dayAheadValues = demandRows
    .map((row) => numeric(row["Day ahead forecast"]))
    .filter((value) => value !== null);
  const dayAheadPeakMw = dayAheadValues.length ? Math.round(Math.max(...dayAheadValues)) : null;

  const mix = {
    solar: solarMw,
    wind: windMw,
    naturalGas: positive(fuels["Natural Gas"]),
    hydro: positive(fuels["Large Hydro"]) + positive(fuels["Small hydro"]),
    nuclear: positive(fuels.Nuclear),
    batteries: positive(batteryMw),
    imports: positive(fuels.Imports),
    other: positive(fuels.Geothermal)
      + positive(fuels.Biomass)
      + positive(fuels.Biogas)
      + positive(fuels.Coal)
      + positive(fuels.Other),
  };
  const positiveSupply = Object.values(mix).reduce((sum, value) => sum + value, 0);

  const headerTimestamp = Date.parse(demandFeed.lastModified);
  const verifiedSourceTimestamp = Number.isFinite(headerTimestamp)
    ? new Date(headerTimestamp).toISOString()
    : sourceTimestamp(demand.Time);

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    sourceUpdatedAt: verifiedSourceTimestamp,
    intervalLabel: `${demand.Time} PT`,
    source: {
      name: "California ISO Today’s Outlook",
      url: "https://www.caiso.com/todays-outlook",
      cadence: "5-minute averages",
      note: "Informational grid data. CAISO OASIS is the official market source.",
    },
    demand: {
      currentMw: Math.round(demandMw),
      hourAheadMw: Math.round(numeric(demand["Hour ahead forecast"]) ?? demandMw),
      dayAheadPeakMw,
      changeFromHourAgoMw: earlierDemand === null ? null : Math.round(demandMw - earlierDemand),
    },
    supply: {
      solarMw: Math.round(solarMw),
      windMw: Math.round(windMw),
      solarWindShare: Number((((solarMw + windMw) / demandMw) * 100).toFixed(1)),
      batteryMw: Math.round(batteryMw),
      batteryState: batteryMw > 50 ? "discharging" : batteryMw < -50 ? "charging" : "balanced",
      mix: Object.entries(mix).map(([key, value]) => mixEntry(key, value, positiveSupply)),
    },
  };
}

try {
  const snapshot = await buildSnapshot();
  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`);
  console.log(`Updated ${OUTPUT_PATH} with CAISO interval ${snapshot.intervalLabel}`);
} catch (error) {
  try {
    await readFile(OUTPUT_PATH, "utf8");
    console.error(`Live refresh failed. The previous snapshot remains intact: ${error.message}`);
  } catch {
    console.error(`Live refresh failed and no previous snapshot exists: ${error.message}`);
  }
  process.exitCode = 1;
}
