import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { validateElectricitySnapshot } from "../assets/js/electricity-desk-schema.js";
import {
  buildSnapshotFromFeeds,
  parseCsv,
  sourceTimestamp,
} from "./update-electricity-data.mjs";

test("the committed snapshot matches schema version 1", async () => {
  const snapshot = JSON.parse(await readFile("assets/data/electricity-desk.json", "utf8"));
  assert.equal(validateElectricitySnapshot(snapshot), snapshot);
});

test("the schema rejects a partial supply mix", async () => {
  const snapshot = JSON.parse(await readFile("assets/data/electricity-desk.json", "utf8"));
  snapshot.supply.mix = snapshot.supply.mix.filter((entry) => entry.label !== "solar");
  assert.throws(() => validateElectricitySnapshot(snapshot), /missing solar/);
});

test("the schema rejects an invalid source timestamp", async () => {
  const snapshot = JSON.parse(await readFile("assets/data/electricity-desk.json", "utf8"));
  snapshot.sourceUpdatedAt = "not-a-date";
  assert.throws(() => validateElectricitySnapshot(snapshot), /valid timestamp/);
});

test("the CSV parser preserves commas and escaped quotes", () => {
  const rows = parseCsv('Time,Label,Value\r\n12:00,"Gas, large","1,234"\r\n12:05,"A ""quote""",5\r\n');
  assert.deepEqual(rows, [
    { Time: "12:00", Label: "Gas, large", Value: "1,234" },
    { Time: "12:05", Label: 'A "quote"', Value: "5" },
  ]);
});

test("a source interval is resolved in Pacific time", () => {
  const now = new Date("2026-08-06T20:05:00.000Z");
  assert.equal(sourceTimestamp("13:00", now), "2026-08-06T20:00:00.000Z");
  assert.throws(() => sourceTimestamp("25:00", now), /Invalid CAISO interval/);
});

test("feed rows produce a validated snapshot with an hourly comparison", () => {
  const demandRows = Array.from({ length: 13 }, (_, index) => ({
    Time: `${12 + Math.floor(index / 12)}:${String((index % 12) * 5).padStart(2, "0")}`,
    "Current demand": String(10_000 + index * 100),
    "Hour ahead forecast": "12,500",
    "Day ahead forecast": String(12_000 + index * 50),
  }));
  const fuelRows = [{
    Time: "13:00",
    Solar: "4,000",
    Wind: "1,000",
    Batteries: "-500",
    "Natural Gas": "5,000",
    "Large Hydro": "500",
    "Small hydro": "100",
    Nuclear: "2,000",
    Imports: "500",
    Geothermal: "200",
    Biomass: "100",
    Biogas: "50",
    Coal: "0",
    Other: "50",
  }];
  const now = new Date("2026-08-06T20:05:00.000Z");
  const snapshot = buildSnapshotFromFeeds(
    { rows: demandRows, lastModified: null },
    { rows: fuelRows, lastModified: null },
    now,
  );

  assert.equal(snapshot.intervalLabel, "13:00 PT");
  assert.equal(snapshot.sourceUpdatedAt, "2026-08-06T20:00:00.000Z");
  assert.equal(snapshot.demand.currentMw, 11_200);
  assert.equal(snapshot.demand.changeFromHourAgoMw, 1_200);
  assert.equal(snapshot.supply.batteryState, "charging");
  assert.equal(validateElectricitySnapshot(snapshot), snapshot);
});
