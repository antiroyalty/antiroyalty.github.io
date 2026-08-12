import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateGridMarketSnapshot } from "../assets/js/grid-market-schema.js";

const SOURCE_URL = "https://oasis.caiso.com/oasisapi/prc_hub_lmp/PRC_HUB_LMP.html";
const OUTPUT_PATH = path.resolve("assets/data/grid-market.json");
const REQUEST_TIMEOUT_MS = 20_000;
const HUB_METADATA = {
  NP15: { name: "NP15", region: "Northern California", coordinates: [38.25, -121.55] },
  ZP26: { name: "ZP26", region: "Central California", coordinates: [35.75, -119.7] },
  SP15: { name: "SP15", region: "Southern California", coordinates: [34.05, -117.55] },
};

function cleanHtml(html) {
  return html
    .replaceAll("&minus;", "-")
    .replaceAll("&nbsp;", " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseHubPriceHtml(html) {
  const text = cleanHtml(html);
  const intervalMatch = text.match(/for\s+(\d{4}-\d{2}-\d{2})\s*,\s*Hour\s+(\d+)\s*,\s*Interval\s+(\d+)/i);
  if (!intervalMatch) throw new Error("CAISO hub feed contained no interval metadata");

  const hubs = Object.keys(HUB_METADATA).map((id) => {
    const row = text.match(new RegExp(`${id}\\s*\\$\\s*(-?\\d+(?:\\.\\d+)?)\\s*\\$\\s*(-?\\d+(?:\\.\\d+)?)\\s*\\$\\s*(-?\\d+(?:\\.\\d+)?)\\s*\\$\\s*(-?\\d+(?:\\.\\d+)?)`, "i"));
    if (!row) throw new Error(`CAISO hub feed contained no ${id} record`);
    return {
      id,
      ...HUB_METADATA[id],
      lmp: Number(row[1]),
      components: {
        energy: Number(row[2]),
        congestion: Number(row[3]),
        loss: Number(row[4]),
      },
    };
  });

  return {
    tradingDate: intervalMatch[1],
    hourEnding: Number(intervalMatch[2]),
    fiveMinuteInterval: Number(intervalMatch[3]),
    hubs,
  };
}

function pacificOffsetMinutes(date) {
  const offsetName = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    timeZoneName: "shortOffset",
  }).formatToParts(date).find((part) => part.type === "timeZoneName")?.value;
  const match = offsetName?.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
  if (!match) throw new Error("Could not resolve the Pacific time offset");
  const minutes = Number(match[2]) * 60 + Number(match[3] ?? 0);
  return match[1] === "+" ? minutes : -minutes;
}

export function intervalTimestamp(parsed) {
  const [year, month, day] = parsed.tradingDate.split("-").map(Number);
  const localClockAsUtc = Date.UTC(
    year,
    month - 1,
    day,
    parsed.hourEnding - 1,
    parsed.fiveMinuteInterval * 5,
  );
  const offset = pacificOffsetMinutes(new Date(Date.UTC(year, month - 1, day, 12)));
  return new Date(localClockAsUtc - offset * 60_000).toISOString();
}

function price(value) {
  return `$${Math.abs(value).toFixed(2)}/MWh`;
}

export function buildGridMarketSnapshot(parsed, now = new Date(), sourceUpdatedAt = intervalTimestamp(parsed)) {
  const byId = Object.fromEntries(parsed.hubs.map((hub) => [hub.id, hub]));
  const northSouthSpread = Number((byId.SP15.lmp - byId.NP15.lmp).toFixed(2));
  const direction = northSouthSpread > 0 ? "higher" : northSouthSpread < 0 ? "lower" : "level with";
  const congestionDifference = byId.SP15.components.congestion - byId.NP15.components.congestion;
  const lossDifference = byId.SP15.components.loss - byId.NP15.components.loss;
  const driver = Math.abs(congestionDifference) >= Math.abs(lossDifference) ? "congestion" : "transmission losses";
  const alignment = Math.abs(northSouthSpread) < 2
    ? "Prices are broadly aligned across the state."
    : Math.abs(northSouthSpread) < 10
      ? "The market is showing moderate north-south separation."
      : "The market is showing strong north-south separation.";

  return validateGridMarketSnapshot({
    schemaVersion: 1,
    generatedAt: now.toISOString(),
    sourceUpdatedAt,
    interval: {
      tradingDate: parsed.tradingDate,
      hourEnding: parsed.hourEnding,
      fiveMinuteInterval: parsed.fiveMinuteInterval,
      label: `${parsed.tradingDate} · hour ending ${parsed.hourEnding} · interval ${parsed.fiveMinuteInterval}`,
    },
    source: {
      name: "California ISO OASIS Hub LMP Prices",
      url: SOURCE_URL,
      cadence: "real-time five-minute interval prices",
      note: "Hub markers are representative market-area anchors, not physical substations.",
    },
    hubs: parsed.hubs,
    insight: {
      northSouthSpread,
      summary: northSouthSpread === 0
        ? `SP15 is level with NP15. ${alignment}`
        : `SP15 is ${price(northSouthSpread)} ${direction} than NP15. ${alignment}`,
      driver: Math.abs(northSouthSpread) < 0.25
        ? "The component differences are negligible in this interval."
        : `The larger component difference is currently ${driver}.`,
    },
  });
}

async function fetchHubPrices() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${SOURCE_URL}?_=${Date.now()}`, {
      headers: { "User-Agent": "Ana-Santasheva-California-Grid-Map/1.0" },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`CAISO hub feed returned HTTP ${response.status}`);
    return {
      html: await response.text(),
      lastModified: response.headers.get("last-modified"),
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function writeSnapshot(snapshot) {
  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  const temporaryPath = `${OUTPUT_PATH}.${process.pid}.tmp`;
  try {
    await writeFile(temporaryPath, `${JSON.stringify(snapshot, null, 2)}\n`);
    await rename(temporaryPath, OUTPUT_PATH);
  } finally {
    await rm(temporaryPath, { force: true });
  }
}

async function main() {
  try {
    const feed = await fetchHubPrices();
    const parsed = parseHubPriceHtml(feed.html);
    const headerTimestamp = Date.parse(feed.lastModified);
    const sourceUpdatedAt = Number.isFinite(headerTimestamp)
      ? new Date(headerTimestamp).toISOString()
      : intervalTimestamp(parsed);
    const snapshot = buildGridMarketSnapshot(parsed, new Date(), sourceUpdatedAt);
    await writeSnapshot(snapshot);
    console.log(`Updated ${OUTPUT_PATH} with ${snapshot.interval.label}`);
  } catch (error) {
    try {
      validateGridMarketSnapshot(JSON.parse(await readFile(OUTPUT_PATH, "utf8")));
      console.error(`Grid market refresh failed. The previous verified snapshot remains intact: ${error.message}`);
    } catch {
      console.error(`Grid market refresh failed and no verified previous snapshot exists: ${error.message}`);
    }
    process.exitCode = 1;
  }
}

const isMain = process.argv[1]
  && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isMain) await main();
