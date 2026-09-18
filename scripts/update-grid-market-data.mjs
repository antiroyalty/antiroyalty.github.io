import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { setTimeout as delay } from "node:timers/promises";
import { validateGridMarketSnapshot } from "../assets/js/grid-market-schema.js";
import { parseCsv } from "./lib/csv.mjs";
import { dayIntervals, pacificDate, shiftDate } from "./lib/intervals.mjs";
import { saveRecords, writeHistoryIndex } from "./lib/data-store.mjs";

const SOURCE_URL = "https://oasis.caiso.com/oasisapi/SingleZip";
const run = promisify(execFile);
const HUB_METADATA = {
  NP15: { name: "NP15", region: "Northern California", coordinates: [38.25, -121.55], node: "TH_NP15_GEN-APND" },
  ZP26: { name: "ZP26", region: "Central California", coordinates: [35.75, -119.7], node: "TH_ZP26_GEN-APND" },
  SP15: { name: "SP15", region: "Southern California", coordinates: [34.05, -117.55], node: "TH_SP15_GEN-APND" },
};
const COMPONENTS = { LMP: "lmp", MCE: "energy", MCC: "congestion", MCL: "loss", MGHG: "ghg" };

export function intervalTimestamp(parsed) {
  const minutes = (parsed.hourEnding - 1) * 60 + (parsed.fiveMinuteInterval - 1) * 5;
  const label = `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
  const candidates = dayIntervals(parsed.tradingDate).filter((slot) => slot.label === label);
  if (candidates.length !== 1) throw new Error("Ambiguous market clock; use OASIS UTC interval timestamps");
  return candidates[0].timestamp;
}

export function parseMarketRows(rows, now = new Date()) {
  const intervals = new Map();
  const nodes = Object.fromEntries(Object.entries(HUB_METADATA).map(([id, hub]) => [hub.node, id]));
  for (const row of rows) {
    const id = nodes[row.NODE];
    const component = COMPONENTS[row.LMP_TYPE];
    if (!id || row.MARKET_RUN_ID !== "RTM") throw new Error("Unexpected market or price node");
    if (!component) {
      throw new Error(`Unexpected price component: ${row.LMP_TYPE}`);
    }
    const start = Date.parse(row.INTERVALSTARTTIME_GMT);
    const end = Date.parse(row.INTERVALENDTIME_GMT);
    if (!Number.isFinite(start) || end - start !== 300_000 || start % 300_000 !== 0) throw new Error("Invalid OASIS UTC interval");
    if (end > now.getTime()) continue;
    if (typeof row.VALUE !== "string" || row.VALUE.trim() === "" || !Number.isFinite(Number(row.VALUE))) throw new Error("Missing or invalid market price");
    const timestamp = new Date(start).toISOString();
    if (row.OPR_DT !== pacificDate(new Date(start))) throw new Error("Trading date disagrees with UTC interval");
    const interval = intervals.get(timestamp) ?? {
      intervalTimeUtc: timestamp, intervalEndUtc: new Date(end).toISOString(), tradingDate: row.OPR_DT,
      hourEnding: Number(row.OPR_HR), fiveMinuteInterval: Number(row.OPR_INTERVAL), prices: {},
    };
    const prices = interval.prices[id] ?? {};
    if (component in prices && prices[component] !== Number(row.VALUE)) throw new Error("Conflicting duplicate market price");
    prices[component] = Number(row.VALUE);
    interval.prices[id] = prices;
    intervals.set(timestamp, interval);
  }
  const records = [];
  for (const interval of intervals.values()) {
    // A partially published interval is not a complete three-hub comparison. Retry on the next run.
    if (!Object.keys(HUB_METADATA).every((id) => Object.values(COMPONENTS).every((key) => Number.isFinite(interval.prices[id]?.[key])))) continue;
    interval.hubs = Object.entries(HUB_METADATA).map(([id, metadata]) => ({
      id, ...metadata, lmp: interval.prices[id].lmp,
      components: { energy: interval.prices[id].energy, congestion: interval.prices[id].congestion, loss: interval.prices[id].loss, ghg: interval.prices[id].ghg },
    }));
    records.push(buildGridMarketSnapshot(interval, now));
  }
  return records.sort((a, b) => a.intervalTimeUtc.localeCompare(b.intervalTimeUtc));
}

function price(value) {
  return `$${Math.abs(value).toFixed(2)}/MWh`;
}

export function buildGridMarketSnapshot(parsed, now = new Date(), sourceUpdatedAt = parsed.intervalTimeUtc ?? intervalTimestamp(parsed)) {
  const byId = Object.fromEntries(parsed.hubs.map((hub) => [hub.id, hub]));
  const northSouthSpread = Number((byId.SP15.lmp - byId.NP15.lmp).toFixed(2));
  const direction = northSouthSpread > 0 ? "higher" : northSouthSpread < 0 ? "lower" : "level with";
  const componentDifferences = ["energy", "congestion", "loss", "ghg"].map((key) => ({
    name: { energy: "energy", congestion: "congestion", loss: "transmission losses", ghg: "greenhouse gas costs" }[key],
    magnitude: Math.abs(byId.SP15.components[key] - byId.NP15.components[key]),
  }));
  const driver = componentDifferences.sort((a, b) => b.magnitude - a.magnitude)[0].name;
  const alignment = Math.abs(northSouthSpread) < 2
    ? "Prices are broadly aligned across the state."
    : Math.abs(northSouthSpread) < 10
      ? "The market is showing moderate north-south separation."
      : "The market is showing strong north-south separation.";

  return validateGridMarketSnapshot({
    schemaVersion: 2,
    intervalTimeUtc: sourceUpdatedAt,
    intervalEndUtc: parsed.intervalEndUtc ?? new Date(Date.parse(sourceUpdatedAt) + 300_000).toISOString(),
    generatedAt: now.toISOString(),
    sourceUpdatedAt,
    interval: {
      tradingDate: parsed.tradingDate,
      hourEnding: parsed.hourEnding,
      fiveMinuteInterval: parsed.fiveMinuteInterval,
      label: `${parsed.tradingDate} · hour ending ${parsed.hourEnding} · interval ${parsed.fiveMinuteInterval}`,
    },
    source: {
      report: "PRC_INTVL_LMP",
      market: "RTM",
      name: "California ISO OASIS Interval LMP",
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

export function marketUrl(date) {
  const slots = dayIntervals(date);
  const format = (time) => time.slice(0, 16).replaceAll("-", "") + "-0000";
  const start = slots[0].timestamp;
  const end = new Date(Date.parse(slots.at(-1).timestamp) + 300_000).toISOString();
  const params = new URLSearchParams({ queryname: "PRC_INTVL_LMP", version: "3", market_run_id: "RTM",
    node: Object.values(HUB_METADATA).map((hub) => hub.node).join(","),
    startdatetime: format(start), enddatetime: format(end), resultformat: "6" });
  return `${SOURCE_URL}?${params}`;
}

export async function fetchMarketRows(date) {
  let response;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    response = await fetch(marketUrl(date), { signal: AbortSignal.timeout(60_000) });
    if (response.status !== 429 && response.status < 500) break;
    if (attempt < 2) {
      const retrySeconds = Number(response.headers.get("retry-after"));
      await response.body?.cancel();
      await delay(Math.max(10_000, Math.min(60_000, retrySeconds * 1000 || 10_000 * (attempt + 1))));
    }
  }
  if (!response.ok) throw new Error(`OASIS returned HTTP ${response.status}`);
  const directory = await mkdtemp(path.join(tmpdir(), "caiso-market-"));
  try {
    const file = path.join(directory, "response.zip");
    await writeFile(file, Buffer.from(await response.arrayBuffer()));
    // Read entries to stdout, never extract server-provided paths into the filesystem.
    const { stdout: listing } = await run("unzip", ["-Z1", file], { maxBuffer: 1_000_000 });
    const names = listing.trim().split("\n");
    if (!names.length || names.some((name) => !/^[a-zA-Z0-9_.-]+\.csv$/.test(name))) {
      throw new Error("OASIS returned no CSV data (the report may be unavailable)");
    }
    const rows = [];
    for (const name of names) {
      const { stdout } = await run("unzip", ["-p", file, name], { maxBuffer: 16_000_000 });
      rows.push(...parseCsv(stdout));
    }
    return rows;
  } finally { await rm(directory, { recursive: true, force: true }); }
}

export async function updateMarket({ dates, dataDir = "assets/data", now = new Date(), fetcher = fetchMarketRows } = {}) {
  const today = pacificDate(now);
  const failures = [];
  let requestCount = 0;
  for (const date of dates ?? [shiftDate(today, -1), today]) {
    // OASIS throttles rapid report downloads. Tests inject an in-memory fetcher.
    if (fetcher === fetchMarketRows && requestCount > 0) await delay(10_000);
    requestCount += 1;
    try {
      const records = parseMarketRows(await fetcher(date), now);
      await saveRecords("market", date, records, dataDir);
      console.log(`Market ${date}: saved ${records.length} verified intervals`);
    } catch (error) { failures.push(`${date}: ${error.message}`); }
  }
  await writeHistoryIndex(dataDir);
  if (failures.length) throw new Error(failures.join("; "));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { await updateMarket({ dates: process.argv.slice(2).length ? process.argv.slice(2) : undefined }); }
  catch (error) { console.error(`Market refresh failed; existing verified files retained: ${error.message}`); process.exitCode = 1; }
}
