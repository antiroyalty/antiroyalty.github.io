import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { validateGridMarketSnapshot } from "../assets/js/grid-market-schema.js";
import { buildGridMarketSnapshot, intervalTimestamp, parseHubPriceHtml } from "./update-grid-market-data.mjs";

const SAMPLE_HTML = `
  <h1>for 2026-08-11, Hour 18, Interval 10</h1>
  <tr><td>NP15</td><td>$67.04149</td><td>$80.74758</td><td>$-9.78983</td><td>$-3.91626</td></tr>
  <tr><td>SP15</td><td>$74.37460</td><td>$80.74758</td><td>$-3.01388</td><td>$-3.35910</td></tr>
  <tr><td>ZP26</td><td>$70.69425</td><td>$80.74758</td><td>$-5.34574</td><td>$-4.70759</td></tr>
`;

test("the CAISO hub-price page parser extracts interval and components", () => {
  const parsed = parseHubPriceHtml(SAMPLE_HTML);
  assert.equal(parsed.tradingDate, "2026-08-11");
  assert.equal(parsed.hourEnding, 18);
  assert.equal(parsed.fiveMinuteInterval, 10);
  assert.equal(parsed.hubs.find((hub) => hub.id === "SP15").components.congestion, -3.01388);
});

test("a CAISO interval is resolved in Pacific time", () => {
  assert.equal(intervalTimestamp({
    tradingDate: "2026-08-11",
    hourEnding: 19,
    fiveMinuteInterval: 9,
  }), "2026-08-12T01:45:00.000Z");
  assert.equal(intervalTimestamp({
    tradingDate: "2026-01-11",
    hourEnding: 19,
    fiveMinuteInterval: 9,
  }), "2026-01-12T02:45:00.000Z");
});

test("the market snapshot explains the north-south spread", () => {
  const snapshot = buildGridMarketSnapshot(parseHubPriceHtml(SAMPLE_HTML), new Date("2026-08-12T00:00:00Z"));
  assert.equal(snapshot.insight.northSouthSpread, 7.33);
  assert.match(snapshot.insight.summary, /SP15.*higher than NP15/);
  assert.match(snapshot.insight.driver, /congestion/);
  assert.equal(validateGridMarketSnapshot(snapshot), snapshot);
});

test("the committed grid market snapshot matches schema version 1", async () => {
  const snapshot = JSON.parse(await readFile("assets/data/grid-market.json", "utf8"));
  assert.equal(validateGridMarketSnapshot(snapshot), snapshot);
});

test("the committed public infrastructure files are valid feature collections", async () => {
  const [lines, substations] = await Promise.all([
    readFile("assets/data/california-transmission.geojson", "utf8").then(JSON.parse),
    readFile("assets/data/california-substations.geojson", "utf8").then(JSON.parse),
  ]);
  assert.equal(lines.type, "FeatureCollection");
  assert.ok(lines.features.length > 1000);
  assert.ok(lines.features.every((feature) => feature.geometry?.type === "LineString" || feature.geometry?.type === "MultiLineString"));
  assert.equal(substations.type, "FeatureCollection");
  assert.ok(substations.features.length > 250);
  assert.ok(substations.features.every((feature) => feature.geometry?.type === "Point"));
});
