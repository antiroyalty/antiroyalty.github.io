import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateElectricitySnapshot } from "../assets/js/electricity-desk-schema.js";
import { parseCsv } from "./lib/csv.mjs";
import { pacificDate, rowsByTimestamp, shiftDate, dayIntervals, validateDate } from "./lib/intervals.mjs";
import { saveRecords, writeHistoryIndex } from "./lib/data-store.mjs";

export { parseCsv };
const SOURCE_URL = "https://www.caiso.com/todays-outlook";

function numeric(value) {
  if (value === null || value === undefined || value.trim() === "") return null;
  const parsed = Number(value.replaceAll(",", ""));
  if (!Number.isFinite(parsed)) throw new TypeError(`Invalid CAISO number: ${value}`);
  return parsed;
}
function positive(value) { return value === null ? null : Math.max(0, value); }
function sum(values) { return values.includes(null) ? null : values.reduce((total, value) => total + value, 0); }

// Compatibility helper for callers with a single clock label; reject ambiguous autumn hours.
export function sourceTimestamp(time, now = new Date()) {
  const dates = [shiftDate(pacificDate(now), -1), pacificDate(now)];
  const candidates = dates.flatMap(dayIntervals).filter((slot) => slot.label === time && Date.parse(slot.timestamp) <= now.getTime());
  if (!candidates.length) throw new Error(`Invalid CAISO interval time: ${time}`);
  const latestDate = pacificDate(new Date(candidates.at(-1).timestamp));
  if (candidates.filter((slot) => pacificDate(new Date(slot.timestamp)) === latestDate).length !== 1) {
    throw new Error(`Ambiguous CAISO interval time: ${time}`);
  }
  return candidates.at(-1).timestamp;
}

export function buildElectricityHistory(demandFeed, fuelFeed, tradingDate, now = new Date()) {
  const demandRows = rowsByTimestamp(demandFeed.rows, tradingDate);
  const fuelRows = rowsByTimestamp(fuelFeed.rows, tradingDate);
  const dayAheadValues = [...demandRows.values()].map((row) => numeric(row["Day ahead forecast"])).filter((value) => value !== null);
  const dayAheadPeakMw = dayAheadValues.length ? Math.max(...dayAheadValues) : null;
  const records = [];
  for (const [timestamp, demand] of demandRows) {
    if (Date.parse(timestamp) > now.getTime()) continue;
    const currentMw = numeric(demand["Current demand"]);
    if (currentMw === null) continue;
    const fuels = fuelRows.get(timestamp);
    // Partial fuel rows are retained as missing measurements, never borrowed from another interval.
    const readFuel = (name) => numeric(fuels?.[name]);
    const solarMw = readFuel("Solar");
    const windMw = readFuel("Wind");
    const batteryMw = readFuel("Batteries");
    const mixValues = {
      solar: positive(solarMw), wind: positive(windMw), naturalGas: positive(readFuel("Natural Gas")),
      hydro: sum([positive(readFuel("Large Hydro")), positive(readFuel("Small hydro"))]),
      nuclear: positive(readFuel("Nuclear")), batteries: positive(batteryMw), imports: positive(readFuel("Imports")),
      other: sum(["Geothermal", "Biomass", "Biogas", "Coal", "Other"].map((name) => positive(readFuel(name)))),
    };
    const total = sum(Object.values(mixValues));
    const earlierTime = new Date(Date.parse(timestamp) - 3_600_000).toISOString();
    const earlierMw = numeric(demandRows.get(earlierTime)?.["Current demand"]);
    records.push(validateElectricitySnapshot({
      schemaVersion: 2,
      generatedAt: now.toISOString(),
      sourceUpdatedAt: timestamp,
      intervalTimeUtc: timestamp,
      intervalLabel: `${tradingDate} ${demand.Time} PT`,
      source: {
        name: "California ISO Today’s Outlook", url: SOURCE_URL, cadence: "5-minute averages",
        note: "Timestamp follows the source clock label. Demand excludes battery charging and dispatchable pumping. Supply shares count positive supply only.",
      },
      demand: {
        currentMw, hourAheadMw: numeric(demand["Hour ahead forecast"]), dayAheadPeakMw,
        changeFromHourAgoMw: earlierMw === null ? null : currentMw - earlierMw,
      },
      supply: {
        solarMw, windMw,
        solarWindShare: solarMw === null || windMw === null ? null : Number(((solarMw + windMw) / currentMw * 100).toFixed(1)),
        batteryMw,
        batteryState: batteryMw === null ? "unavailable" : batteryMw > 50 ? "discharging" : batteryMw < -50 ? "charging" : "balanced",
        mix: Object.entries(mixValues).map(([label, mw]) => ({ label, mw, share: total > 0 ? Number((mw / total * 100).toFixed(1)) : null })),
      },
    }));
  }
  return records;
}

export function buildSnapshotFromFeeds(demandFeed, fuelFeed, now = new Date(), tradingDate = pacificDate(now)) {
  const records = buildElectricityHistory(demandFeed, fuelFeed, tradingDate, now);
  if (!records.length) throw new Error("CAISO demand feed contained no current demand value");
  return records.at(-1);
}

async function fetchFeed(date, filename) {
  const url = `https://www.caiso.com/outlook/history/${date.replaceAll("-", "")}/${filename}`;
  const response = await fetch(url, { signal: AbortSignal.timeout(25_000) });
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);
  return { rows: parseCsv(await response.text()) };
}

export async function updateElectricity({ dates, dataDir = "assets/data", now = new Date(), fetcher = fetchFeed } = {}) {
  const today = pacificDate(now);
  const failures = [];
  for (const date of dates ?? [shiftDate(today, -1), today]) {
    try {
      validateDate(date);
      const [demand, fuels] = await Promise.all([fetcher(date, "demand.csv"), fetcher(date, "fuelsource.csv")]);
      const records = buildElectricityHistory(demand, fuels, date, now);
      await saveRecords("electricity", date, records, dataDir);
      console.log(`Electricity ${date}: saved ${records.length} verified intervals`);
    } catch (error) { failures.push(`${date}: ${error.message}`); }
  }
  await writeHistoryIndex(dataDir);
  if (failures.length) throw new Error(failures.join("; "));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { await updateElectricity({ dates: process.argv.slice(2).length ? process.argv.slice(2) : undefined }); }
  catch (error) { console.error(`Electricity refresh failed; existing verified files retained: ${error.message}`); process.exitCode = 1; }
}
