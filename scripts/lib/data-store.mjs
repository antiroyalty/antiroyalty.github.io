import { mkdir, readFile, rename, rm, writeFile, readdir } from "node:fs/promises";
import path from "node:path";
import { validateElectricitySnapshot } from "../../assets/js/electricity-desk-schema.js";
import { validateGridMarketSnapshot } from "../../assets/js/grid-market-schema.js";
import { dayIntervals, validateDate } from "./intervals.mjs";

export const DATASETS = {
  electricity: { file: "electricity-desk.json", validate: validateElectricitySnapshot },
  market: { file: "grid-market.json", validate: validateGridMarketSnapshot },
};

export async function readJson(file) {
  try { return JSON.parse(await readFile(file, "utf8")); }
  catch (error) { if (error.code === "ENOENT") return null; throw error; }
}

export async function writeJson(file, value) {
  await mkdir(path.dirname(file), { recursive: true });
  const temporary = `${file}.${process.pid}.tmp`;
  try {
    await writeFile(temporary, `${JSON.stringify(value)}\n`);
    await rename(temporary, file);
  } finally { await rm(temporary, { force: true }); }
}

function hasNewMissingValue(previous, incoming) {
  if (incoming === null) return previous !== null && previous !== undefined;
  if (!incoming || typeof incoming !== "object") return false;
  return Object.keys(incoming).some((key) => hasNewMissingValue(previous?.[key], incoming[key]));
}

export function mergeRecords(previous, incoming, validate) {
  const records = new Map();
  for (const record of [...previous, ...incoming]) {
    validate(record);
    if (record.schemaVersion !== 2) throw new TypeError("History requires explicit version 2 intervals");
    const prior = records.get(record.intervalTimeUtc);
    if (prior && Date.parse(prior.generatedAt) > Date.parse(record.generatedAt)) continue;
    // A later partial response must not erase a previously observed value for the same interval.
    if (prior && hasNewMissingValue(prior, record)) continue;
    const comparable = (value) => JSON.stringify({ ...value, generatedAt: null });
    records.set(record.intervalTimeUtc, prior && comparable(prior) === comparable(record) ? prior : record);
  }
  return [...records.values()].sort((a, b) => a.intervalTimeUtc.localeCompare(b.intervalTimeUtc));
}

export function validateDay(day, dataset, date) {
  validateDate(date);
  if (day?.schemaVersion !== 1 || day.dataset !== dataset || day.tradingDate !== date || !Array.isArray(day.records)) {
    throw new TypeError(`Invalid ${dataset} history for ${date}`);
  }
  const slots = new Set(dayIntervals(date).map((slot) => slot.timestamp));
  const records = mergeRecords([], day.records, DATASETS[dataset].validate);
  if (records.length !== day.records.length || records.some((record, index) => !slots.has(record.intervalTimeUtc)
    || record.intervalTimeUtc !== day.records[index].intervalTimeUtc)) {
    throw new TypeError(`Duplicate, unordered, or out-of-day ${dataset} history`);
  }
  return day;
}

// Re-reading a date replaces revised intervals but never deletes an interval during a source outage.
export async function saveRecords(dataset, date, incoming, dataDir = "assets/data") {
  const spec = DATASETS[dataset];
  const file = path.join(dataDir, "history", dataset, `${date}.json`);
  const previous = await readJson(file);
  if (previous) validateDay(previous, dataset, date);
  const records = mergeRecords(previous?.records ?? [], incoming, spec.validate);
  const day = validateDay({ schemaVersion: 1, dataset, tradingDate: date, records }, dataset, date);
  if (!records.length) throw new Error(`No verified ${dataset} intervals for ${date}`);
  await writeJson(file, day);
  const latestFile = path.join(dataDir, spec.file);
  const latest = await readJson(latestFile);
  if (latest) spec.validate(latest);
  const candidate = records.at(-1);
  const latestTime = latest?.intervalTimeUtc ?? latest?.sourceUpdatedAt;
  if (!latest || Date.parse(candidate.intervalTimeUtc) > Date.parse(latestTime)
    || (candidate.intervalTimeUtc === latestTime && Date.parse(candidate.generatedAt) >= Date.parse(latest.generatedAt))) {
    await writeJson(latestFile, candidate);
  }
}

export async function writeHistoryIndex(dataDir = "assets/data", now = new Date()) {
  const datasets = {};
  for (const dataset of Object.keys(DATASETS)) {
    const directory = path.join(dataDir, "history", dataset);
    const files = await readdir(directory).catch((error) => { if (error.code === "ENOENT") return []; throw error; });
    datasets[dataset] = [];
    for (const file of files.filter((file) => /^\d{4}-\d{2}-\d{2}\.json$/.test(file)).sort()) {
      const date = file.slice(0, 10);
      const day = validateDay(await readJson(path.join(directory, file)), dataset, date);
      const expected = dayIntervals(date);
      const present = new Set(day.records.map((record) => record.intervalTimeUtc));
      const due = expected.filter((slot) => Date.parse(slot.timestamp) + (dataset === "market" ? 300_000 : 0) <= now.getTime());
      datasets[dataset].push({
        date, path: `${dataset}/${file}`, intervalCount: present.size, expectedIntervalCount: expected.length,
        pendingIntervalCount: expected.length - due.length,
        missingIntervals: due.filter((slot) => !present.has(slot.timestamp)).map((slot) => slot.timestamp),
      });
    }
  }
  await writeJson(path.join(dataDir, "history/index.json"), { schemaVersion: 1, datasets });
}
