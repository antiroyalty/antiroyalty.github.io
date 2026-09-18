import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { validateGridMarketSnapshot } from "../assets/js/grid-market-schema.js";
import { parseMarketRows, marketUrl, intervalTimestamp } from "./update-grid-market-data.mjs";
import { parseCsv } from "./lib/csv.mjs";
const rows = parseCsv(await readFile(new URL("fixtures/hub-prices.csv", import.meta.url), "utf8"));
const now = new Date("2026-09-18T08:00:00Z");

test("OASIS CSV retains all intervals, negative components, and true UTC boundaries", () => {
  const records = parseMarketRows(rows, now);
  assert.equal(records.length, 2);
  assert.equal(records[0].intervalTimeUtc, "2026-09-18T07:00:00.000Z");
  assert.equal(records[0].intervalEndUtc, "2026-09-18T07:05:00.000Z");
  assert.equal(records[0].hubs.find((hub) => hub.id === "NP15").components.congestion, -0.01265);
  records.forEach(validateGridMarketSnapshot);
});

test("partial intervals and future intervals never become a complete comparison", () => {
  const partial = rows.filter((row) => !(row.OPR_INTERVAL === "1" && row.NODE === "TH_SP15_GEN-APND"));
  assert.equal(parseMarketRows(partial, now).length, 1);
  assert.equal(parseMarketRows(rows, new Date("2026-09-18T07:04:00Z")).length, 0);
});

test("missing prices, conflicting duplicates, and wrong markets fail clearly", () => {
  assert.throws(() => parseMarketRows([{ ...rows[0], VALUE: "" }], now), /Missing/);
  assert.throws(() => parseMarketRows([...rows, { ...rows[0], VALUE: "123" }], now), /duplicate/);
  assert.throws(() => parseMarketRows([{ ...rows[0], MARKET_RUN_ID: "DAM" }], now), /Unexpected/);
});

test("daily price requests cover 23- and 25-hour Pacific days", () => {
  const spring = new URL(marketUrl("2026-03-08")).searchParams;
  assert.equal(spring.get("startdatetime"), "20260308T08:00-0000");
  assert.equal(spring.get("enddatetime"), "20260309T07:00-0000");
  const fall = new URL(marketUrl("2026-11-01")).searchParams;
  assert.equal(fall.get("startdatetime"), "20261101T07:00-0000");
  assert.equal(fall.get("enddatetime"), "20261102T08:00-0000");
  assert.throws(() => intervalTimestamp({ tradingDate: "2026-11-01", hourEnding: 2, fiveMinuteInterval: 1 }), /Ambiguous/);
});

test("the market validator rejects inconsistent price components and spreads", () => {
  const snapshot = parseMarketRows(rows, now)[0];
  snapshot.insight.northSouthSpread = 100;
  assert.throws(() => validateGridMarketSnapshot(snapshot), /Spread/);
  snapshot.hubs[0].components.energy = 500;
  assert.throws(() => validateGridMarketSnapshot(snapshot), /reconcile/);
});

test("committed snapshots and public infrastructure remain valid", async () => {
  validateGridMarketSnapshot(JSON.parse(await readFile("assets/data/grid-market.json", "utf8")));
  for (const [file, minimum, types] of [
    ["california-transmission.geojson", 1000, ["LineString", "MultiLineString"]],
    ["california-substations.geojson", 250, ["Point"]],
  ]) {
    const data = JSON.parse(await readFile(`assets/data/${file}`, "utf8"));
    assert.equal(data.type, "FeatureCollection");
    assert.ok(data.features.length > minimum);
    assert.ok(data.features.every((feature) => types.includes(feature.geometry?.type)));
  }
});
