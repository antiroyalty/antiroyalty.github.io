import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildTimeline, chartSegments, findDayEvents, mergeLatest, netDemandMw, validateHistoryDay, validateHistoryIndex, availableDates } from "../assets/js/grid-history.js";
import { dayIntervals } from "../assets/js/grid-time.js";

const date = "2026-09-17";
const electricity = JSON.parse(await readFile(`assets/data/history/electricity/${date}.json`, "utf8"));
const market = JSON.parse(await readFile(`assets/data/history/market/${date}.json`, "utf8"));

test("archive validation rejects duplicates, incorrect dates, and unsafe manifest paths", () => {
  assert.equal(validateHistoryDay(electricity, "electricity", date).length, 288);
  assert.equal(validateHistoryDay(market, "market", date).length, 288);
  assert.throws(() => validateHistoryDay({ ...market, records: [market.records[0], market.records[0]] }, "market", date));
  assert.throws(() => validateHistoryDay(market, "market", "2026-09-18"));
  const index = { schemaVersion: 1, datasets: { electricity: [{ date, path: `electricity/${date}.json`, intervalCount: 288 }], market: [] } };
  assert.deepEqual(availableDates(validateHistoryIndex(index)), [date]);
  index.datasets.electricity[0].path = "https://other.example/file.json";
  assert.throws(() => validateHistoryIndex(index));
});

test("a shared timeline uses exact UTC joins and preserves missing and not-yet-due intervals", () => {
  const now = Date.parse(electricity.records[2].intervalTimeUtc);
  const rows = buildTimeline(date, [electricity.records[0], electricity.records[2]], [market.records[1]], now);
  assert.equal(rows[0].market, null);
  assert.equal(rows[1].electricity, null);
  assert.equal(rows[1].market, market.records[1]);
  assert.equal(rows[2].electricityPending, false);
  assert.equal(rows[2].marketPending, true);
  assert.equal(rows[1].marketPending, false);
  assert.equal(rows[3].electricityPending, true);
});

test("Pacific daylight-saving days keep their true interval counts and repeated hours", () => {
  assert.equal(buildTimeline("2026-03-08").length, 276);
  const fall = buildTimeline("2026-11-01");
  assert.equal(fall.length, 300);
  const repeated = fall.filter((row) => row.label === "01:00");
  assert.equal(repeated.length, 2);
  assert.equal(repeated[1].timeMs - repeated[0].timeMs, 3_600_000);
});

test("chart segments never connect across missing data, and preserve real zero", () => {
  const rows = [1, 0, null, 3, undefined, 5].map((value) => ({ value }));
  assert.deepEqual(chartSegments(rows, (r) => r.value, (i) => i, (v) => v), [[[0, 1], [1, 0]], [[3, 3]], [[5, 5]]]);
});

test("latest snapshots cannot replace a newer archive revision or enter the wrong day", () => {
  const first = electricity.records[0];
  const old = { ...first, generatedAt: "2020-01-01T00:00:00Z" };
  assert.equal(mergeLatest([first], old, date)[0], first);
  const partial = { ...first, generatedAt: "2027-01-01T00:00:00Z", supply: { ...first.supply, solarMw: null } };
  assert.equal(mergeLatest([first], partial, date)[0], first);
  assert.equal(mergeLatest([], first, "2026-09-18").length, 0);
});

test("event presets select measured negative prices and the absolute north–south gap", () => {
  const rows = buildTimeline(date, electricity.records, market.records);
  const events = findDayEvents(rows);
  assert.ok(events.negative);
  assert.equal(events.negative.value, Math.min(...market.records.flatMap((r) => r.hubs.map((h) => h.lmp))));
  assert.equal(Math.abs(events.spread.value), Math.max(...market.records.map((r) => Math.abs(r.insight.northSouthSpread))));
  assert.ok(events.ramp.value > 0);
  const rampEnd = rows[events.ramp.index];
  assert.equal(events.ramp.value, netDemandMw(rampEnd) - netDemandMw(rows[events.ramp.index - 12]));
  assert.ok(rampEnd.label >= "16:00" && rampEnd.label <= "21:00");
  assert.deepEqual(findDayEvents(buildTimeline(date)), { negative: null, spread: null, ramp: null });
});

test("an evening ramp needs a full contiguous hour of solar, wind, and demand", () => {
  const rows = dayIntervals(date).map((slot, i) => ({ ...slot, timeMs: Date.parse(slot.timestamp), electricity: { demand: { currentMw: 1000 + i }, supply: { solarMw: 0, windMw: 0 } } }));
  assert.equal(findDayEvents(rows).ramp.value, 12);
  // Remove at least one observation from every possible one-hour window.
  rows.forEach((row, i) => { if (i % 12 === 0) row.electricity.supply.windMw = null; });
  assert.equal(findDayEvents(rows).ramp, null);
  assert.equal(netDemandMw(rows[0]), null);
});

test("slider markers follow Pacific clock times and show Now only within that day", async () => {
  const { sliderTimeMarkers } = await import("../assets/js/grid-history.js");
  const rows = buildTimeline(date);
  const noon = rows.find((row) => row.label === "12:00");
  const markers = sliderTimeMarkers(rows, noon.timeMs);
  assert.deepEqual(markers.ticks.map((tick) => tick.label), ["12am", "6am", "12pm", "6pm", "11:55pm"]);
  assert.equal(markers.nowPercent, markers.ticks[2].percent);
  assert.equal(sliderTimeMarkers(rows, rows[0].timeMs - 1).nowPercent, null);
  assert.equal(sliderTimeMarkers(rows, rows.at(-1).timeMs + 300_000).nowPercent, null);
  assert.equal(sliderTimeMarkers(rows, rows.at(-1).timeMs + 120_000).nowPercent, 100);
  const fall = buildTimeline("2026-11-01");
  const six = fall.find((row) => row.label === "06:00");
  const fallMarkers = sliderTimeMarkers(fall, six.timeMs);
  assert.equal(fallMarkers.ticks[1].percent, 84 / 299 * 100);
  assert.equal(fallMarkers.nowPercent, fallMarkers.ticks[1].percent);
});
