import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, readFile } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import { buildElectricityHistory, updateElectricity } from "./update-electricity-data.mjs";
import { dayIntervals, rowsByTimestamp } from "./lib/intervals.mjs";
import { saveRecords, readJson, writeHistoryIndex, mergeRecords } from "./lib/data-store.mjs";
import { restoreState, persistState } from "./sync-grid-state.mjs";
import { validateElectricitySnapshot } from "../assets/js/electricity-desk-schema.js";
import { freshnessFor } from "../assets/js/data-freshness.js";
import { parseMarketRows } from "./update-grid-market-data.mjs";
import { parseCsv } from "./lib/csv.mjs";

const now = new Date("2026-09-18T20:30:00Z");
const demand = (time, value = "10000") => ({ Time: time, "Current demand": value });
const fuels = (time) => ({ Time: time, Solar: "4000", Wind: "1000", Batteries: "-500", "Natural Gas": "2000", "Large Hydro": "500", "Small hydro": "100", Nuclear: "1000", Imports: "-200", Geothermal: "100", Biomass: "100", Biogas: "100", Coal: "0", Other: "0" });
function history(demandRows, fuelRows, date = "2026-09-18", time = now) {
  return buildElectricityHistory({ rows: demandRows }, { rows: fuelRows }, date, time);
}

test("missing values remain null, while measured zero remains zero", () => {
  const [snapshot] = history([demand("13:00")], [{ Time: "13:00", Solar: "0" }]);
  assert.equal(snapshot.supply.solarMw, 0);
  assert.equal(snapshot.supply.windMw, null);
  assert.equal(snapshot.supply.batteryMw, null);
  assert.equal(snapshot.supply.batteryState, "unavailable");
  assert.equal(snapshot.demand.hourAheadMw, null);
  assert.equal(snapshot.supply.solarWindShare, null);
  assert.ok(snapshot.supply.mix.every((entry) => entry.share === null));
});

test("different demand and supply times never share values", () => {
  const [snapshot] = history([demand("13:00")], [fuels("12:55")]);
  assert.equal(snapshot.supply.solarMw, null);
  assert.equal(snapshot.sourceUpdatedAt, "2026-09-18T20:00:00.000Z");
});

test("hourly changes use timestamps instead of row offsets", () => {
  const rows = [demand("12:00", "9000"), demand("13:00", "11000")];
  const records = history(rows, rows.map((row) => fuels(row.Time)));
  assert.equal(records.at(-1).demand.changeFromHourAgoMw, 2000);
  assert.equal(records[0].demand.changeFromHourAgoMw, null);
});

test("all intervening five-minute rows survive a fifteen-minute refresh", () => {
  const records = history(["13:00", "13:05", "13:10", "13:15"].map((time) => demand(time)), ["13:00", "13:05", "13:10", "13:15"].map(fuels));
  assert.equal(records.length, 4);
  assert.equal(records.at(-1).intervalTimeUtc, "2026-09-18T20:15:00.000Z");
});

test("signed source power is preserved while the positive-supply mix excludes exports and charging", () => {
  const [snapshot] = history([demand("13:00")], [{ ...fuels("13:00"), Solar: "-40" }]);
  assert.equal(snapshot.supply.solarMw, -40);
  assert.equal(snapshot.supply.batteryMw, -500);
  assert.equal(snapshot.supply.mix.find((entry) => entry.label === "imports").mw, 0);
  assert.equal(snapshot.supply.mix.find((entry) => entry.label === "batteries").mw, 0);
  assert.ok(Math.abs(snapshot.supply.mix.reduce((sum, entry) => sum + entry.share, 0) - 100) < 0.5);
});

test("invalid numeric data is rejected", () => {
  assert.throws(() => history([demand("13:00")], [{ ...fuels("13:00"), Wind: "broken" }]), /Invalid CAISO number/);
});

test("DST dates have 276/300 slots; duplicate autumn labels resolve to distinct UTC instants", () => {
  assert.equal(dayIntervals("2026-03-08").length, 276);
  assert.equal(dayIntervals("2026-11-01").length, 300);
  const mapped = rowsByTimestamp([{ Time: "01:00" }, { Time: "01:00" }], "2026-11-01");
  assert.deepEqual([...mapped.keys()], ["2026-11-01T08:00:00.000Z", "2026-11-01T09:00:00.000Z"]);
  assert.throws(() => rowsByTimestamp([{ Time: "01:00" }], "2026-11-01"), /ambiguous/);
  assert.throws(() => dayIntervals("2026-02-30"), /Invalid trading date/);
});

test("history merges revisions, exposes gaps, and restores latest data across clean deployments", async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), "grid-test-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const data = path.join(directory, "data");
  const state = path.join(directory, "state");
  const freshCheckout = path.join(directory, "checkout");
  const initial = history([demand("13:00"), demand("13:10")], [fuels("13:00"), fuels("13:10")]);
  await saveRecords("electricity", "2026-09-18", initial, data);
  await saveRecords("electricity", "2026-09-18", history([demand("13:00", "12345")], [fuels("13:00")]), data);
  assert.equal((await readJson(path.join(data, "electricity-desk.json"))).intervalTimeUtc, initial.at(-1).intervalTimeUtc);
  const archive = await readJson(path.join(data, "history/electricity/2026-09-18.json"));
  assert.equal(archive.records.length, 2);
  assert.equal(archive.records[0].demand.currentMw, 12345);
  const priceRows = parseCsv(await readFile(new URL("fixtures/hub-prices.csv", import.meta.url), "utf8"));
  await saveRecords("market", "2026-09-18", parseMarketRows(priceRows, now), data);
  await persistState(state, data);
  await restoreState(state, freshCheckout);
  assert.deepEqual(await readJson(path.join(freshCheckout, "electricity-desk.json")), await readJson(path.join(data, "electricity-desk.json")));
  await writeHistoryIndex(freshCheckout, now);
  const index = await readJson(path.join(freshCheckout, "history/index.json"));
  assert.equal(index.datasets.electricity[0].intervalCount, 2);
  assert.ok(index.datasets.electricity[0].missingIntervals.includes("2026-09-18T20:05:00.000Z"));
  const before = await readFile(path.join(data, "electricity-desk.json"), "utf8");
  await assert.rejects(updateElectricity({ dataDir: data, dates: ["2026-09-18"], now, fetcher: async () => { throw new Error("Source unavailable"); } }), /Source unavailable/);
  assert.equal(await readFile(path.join(data, "electricity-desk.json"), "utf8"), before);
  await assert.rejects(saveRecords("electricity", "2026-09-17", initial, data), /out-of-day/);
});

test("freshness ages through current, delayed, and stale even without another fetch", () => {
  const snapshot = { intervalTimeUtc: "2026-09-18T20:00:00Z" };
  assert.equal(freshnessFor(snapshot, Date.parse("2026-09-18T20:45:00Z")).key, "live");
  assert.equal(freshnessFor(snapshot, Date.parse("2026-09-18T20:46:00Z")).key, "delayed");
  assert.equal(freshnessFor(snapshot, Date.parse("2026-09-18T23:01:00Z")).key, "stale");
  assert.equal(freshnessFor(snapshot, Date.parse("2026-09-18T20:10:00Z"), true).label, "Refresh delayed");
  assert.equal(freshnessFor(null).key, "unavailable");
  assert.equal(freshnessFor(snapshot, Date.parse("2026-09-18T19:00:00Z")).key, "unavailable");
});

test("the terminal midnight forecast belongs to the following day", () => {
  const mapped = rowsByTimestamp([{ Time: "00:00" }, { Time: "23:55" }, { Time: "00:00" }], "2026-09-18");
  assert.equal(mapped.size, 2);
  assert.equal([...mapped.keys()][0], "2026-09-18T07:00:00.000Z");
});

test("revisions preserve known measurements and ignore an older collection", () => {
  const complete = history([demand("13:00")], [fuels("13:00")])[0];
  const partial = history([demand("13:00")], [], "2026-09-18", new Date("2026-09-18T21:00:00Z"))[0];
  assert.deepEqual(mergeRecords([complete], [partial], validateElectricitySnapshot), [complete]);
  const older = { ...complete, generatedAt: "2026-09-18T20:00:00Z", demand: { ...complete.demand, hourAheadMw: 123 } };
  assert.deepEqual(mergeRecords([complete], [older], validateElectricitySnapshot), [complete]);
});

test("history index distinguishes elapsed gaps from future slots", async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), "grid-index-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const atMidnight = new Date("2026-09-18T07:00:00Z");
  await saveRecords("electricity", "2026-09-18", history([demand("00:00")], [fuels("00:00")], "2026-09-18", atMidnight), directory);
  await writeHistoryIndex(directory, atMidnight);
  const day = (await readJson(path.join(directory, "history/index.json"))).datasets.electricity[0];
  assert.equal(day.pendingIntervalCount, 287);
  assert.deepEqual(day.missingIntervals, []);
});
