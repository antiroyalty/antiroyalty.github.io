import { dayIntervals, validateDate, FIVE_MINUTES_MS } from "./grid-time.js";
import { validateElectricitySnapshot } from "./electricity-desk-schema.js";
import { validateGridMarketSnapshot } from "./grid-market-schema.js";

export const HISTORY_DATASETS = ["electricity", "market"];

export function validateHistoryIndex(index) {
  if (index?.schemaVersion !== 1 || !index.datasets) throw new TypeError("Invalid history index");
  for (const dataset of HISTORY_DATASETS) {
    const entries = index.datasets[dataset];
    if (!Array.isArray(entries)) throw new TypeError(`Missing ${dataset} history index`);
    const dates = new Set();
    for (const entry of entries) {
      validateDate(entry?.date);
      if (dates.has(entry.date) || entry.path !== `${dataset}/${entry.date}.json`
        || !Number.isInteger(entry.intervalCount) || entry.intervalCount < 0) {
        throw new TypeError(`Invalid ${dataset} history entry`);
      }
      dates.add(entry.date);
    }
  }
  return index;
}

export function availableDates(index) {
  return [...new Set(HISTORY_DATASETS.flatMap((key) => index.datasets[key].map((entry) => entry.date)))].sort();
}

export function validateHistoryDay(day, dataset, date) {
  if (!HISTORY_DATASETS.includes(dataset) || day?.schemaVersion !== 1 || day.dataset !== dataset
    || day.tradingDate !== date || !Array.isArray(day.records)) throw new TypeError("Invalid history day");
  const allowed = new Set(dayIntervals(date).map((slot) => slot.timestamp));
  const validate = dataset === "market" ? validateGridMarketSnapshot : validateElectricitySnapshot;
  let previous = "";
  for (const record of day.records) {
    validate(record);
    if (record.schemaVersion !== 2 || !allowed.has(record.intervalTimeUtc) || record.intervalTimeUtc <= previous) {
      throw new TypeError("History contains duplicate, unordered, or out-of-day intervals");
    }
    previous = record.intervalTimeUtc;
  }
  return day.records;
}

// UTC keys join measurements exactly; missing values never borrow from a nearby interval.
export function buildTimeline(date, electricity = [], market = [], nowMs = Date.now()) {
  const byDataset = [electricity, market].map((records) => new Map(records.map((record) => [record.intervalTimeUtc, record])));
  return dayIntervals(date).map((slot) => ({
    ...slot,
    timeMs: Date.parse(slot.timestamp),
    electricity: byDataset[0].get(slot.timestamp) ?? null,
    market: byDataset[1].get(slot.timestamp) ?? null,
    electricityPending: Date.parse(slot.timestamp) > nowMs,
    marketPending: Date.parse(slot.timestamp) + FIVE_MINUTES_MS > nowMs,
  }));
}

export function mergeLatest(records, latest, date) {
  if (!latest || !dayIntervals(date).some((slot) => slot.timestamp === latest.intervalTimeUtc)) return records;
  const merged = new Map(records.map((record) => [record.intervalTimeUtc, record]));
  const previous = merged.get(latest.intervalTimeUtc);
  const losesMeasurement = (before, after) => {
    if (after === null) return before !== null && before !== undefined;
    if (!after || typeof after !== "object") return false;
    return Object.keys(after).some((key) => losesMeasurement(before?.[key], after[key]));
  };
  if (!previous || (Date.parse(latest.generatedAt) > Date.parse(previous.generatedAt) && !losesMeasurement(previous, latest))) {
    merged.set(latest.intervalTimeUtc, latest);
  }
  return [...merged.values()].sort((a, b) => a.intervalTimeUtc.localeCompare(b.intervalTimeUtc));
}

export function netDemandMw(row) {
  const demand = row?.electricity?.demand?.currentMw;
  const { solarMw, windMw } = row?.electricity?.supply ?? {};
  return [demand, solarMw, windMw].every(Number.isFinite) ? demand - solarMw - windMw : null;
}

export function findDayEvents(rows) {
  let negative = null;
  let spread = null;
  let ramp = null;
  rows.forEach((row, index) => {
    for (const hub of row.market?.hubs ?? []) {
      if (hub.lmp < 0 && (!negative || hub.lmp < negative.value)) negative = { index, value: hub.lmp, hub: hub.id };
    }
    const difference = row.market?.insight?.northSouthSpread;
    if (Number.isFinite(difference) && Math.abs(difference) > 0 && (!spread || Math.abs(difference) > Math.abs(spread.value))) {
      spread = { index, value: difference };
    }
    // An evening event is a positive one-hour rise ending between 16:00 and 21:00 Pacific.
    if (row.label < "16:00" || row.label > "21:00" || index < 12) return;
    const hour = rows.slice(index - 12, index + 1);
    if (hour.some((point, i) => !Number.isFinite(netDemandMw(point))
      || (i > 0 && point.timeMs - hour[i - 1].timeMs !== FIVE_MINUTES_MS))) return;
    const riseMw = netDemandMw(row) - netDemandMw(hour[0]);
    if (riseMw > 0 && (!ramp || riseMw > ramp.value)) ramp = { index, value: riseMw };
  });
  return { negative, spread, ramp };
}

// Each missing sample starts a new path, including internal holes in an otherwise complete day.
export function chartSegments(rows, valueFor, xFor, yFor) {
  const segments = [];
  let points = [];
  rows.forEach((row, index) => {
    const value = valueFor(row);
    if (!Number.isFinite(value)) {
      if (points.length) segments.push(points);
      points = [];
    } else points.push([xFor(index), yFor(value)]);
  });
  if (points.length) segments.push(points);
  return segments;
}
