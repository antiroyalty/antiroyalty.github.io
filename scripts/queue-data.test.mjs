import test from "node:test";
import assert from "node:assert/strict";
import { readFile, mkdtemp, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { queueDays, median, technology, compareQueues, matchSubstation, validateQueueSnapshot, validateQueueIndex, countyLabel } from "../assets/js/queue-data.js";
import { validateQueueArchive, mergeQueueArchive } from "./lib/queue-store.mjs";

const project = {id: "2207", name: "Alisa Solar Energy Complex 2", status: "ACTIVE", queueDate: "2025-02-12", completedDate: null, withdrawnDate: null, netMw: 500, components: [{fuel: "Photovoltaic/Solar", capacityMw: 500}, {fuel: "Storage/Battery", capacityMw: 500}]};

test("queue age uses the report date or actual exit; missing and inverted dates remain unknown", () => {
  assert.equal(queueDays(project, "2025-02-12"), 0);
  assert.equal(queueDays(project, "2025-02-13"), 1);
  assert.equal(queueDays({...project, status: "WITHDRAWN"}, "2026-09-18"), null);
  assert.equal(queueDays({...project, status: "WITHDRAWN", withdrawnDate: "2025-02-15"}, "2026-09-18"), 3);
  assert.equal(queueDays({...project, status: "COMPLETED", completedDate: "2025-02-14"}, "2026-09-18"), 2);
  assert.equal(queueDays({...project, queueDate: "2025-02-30"}, "2026-09-18"), null);
  assert.equal(queueDays(project, "2024-01-01"), null);
  assert.equal(median([null, 0, 2]), 1);
  assert.equal(median([null]), null);
});

test("hybrid categories preserve the shared connection limit and unknown components", () => {
  assert.equal(technology(project), "Solar + storage");
  assert.equal(project.netMw, 500);
  assert.equal(technology({...project, components: [{fuel: "Wind Turbine", capacityMw: 80}, {fuel: "Battery", capacityMw: 30}]}), "Wind + storage");
  assert.equal(technology({...project, components: []}), "Other / unspecified");
  assert.equal(technology({...project, components: [{fuel: "Pumped-Storage hydro", capacityMw: 500}]}), "Storage");
  assert.equal(technology({...project, components: [{fuel: "Water", capacityMw: 20}]}), "Hydro");
});

test("county filters combine case and suffix variations without rewriting source geography", () => {
  assert.equal(countyLabel("FRESNO COUNTY"), countyLabel("Fresno"));
  assert.equal(countyLabel("Los Angeles County"), "Los Angeles");
  assert.equal(countyLabel("Kings and Fresno"), "Kings And Fresno");
  assert.equal(countyLabel("TBD"), "Not reported");
});

test("changes use queue identity, preserve before/after, and never infer withdrawal from absence", () => {
  const previous = {projects: [project, {...project, id: "22"}]};
  const current = {projects: [{...project, status: "WITHDRAWN", netMw: 0}, {...project, id: "32"}]};
  assert.equal(compareQueues(null, current), null);
  const changes = compareQueues(previous, current);
  assert.deepEqual(changes.map(c => c.kind), ["updated", "appeared", "absent"]);
  assert.deepEqual(changes[0].fields.find(f => f.key === "netMw"), {key: "netMw", before: 500, after: 0});
  assert.deepEqual(compareQueues({projects: [project]}, {projects: [{...project, sourceRow: 99}]}), []);
});

test("map matches only unambiguous station, owner and county; never a proposed line", () => {
  const p = {...project, state: "CA", poi: "Whirlwind Substation 230kV", utility: "SCE", county: "KERN"};
  const f = {geometry: {type: "Point", coordinates: [-118.43, 34.85]}, properties: {Name: "Whirlwind", Owner: "SCE", COUNTY: "Kern County"}};
  assert.equal(matchSubstation(p, [f]), f);
  assert.equal(matchSubstation(p, [f, f]), null);
  assert.equal(matchSubstation({...p, county: "LOS ANGELES"}, [f]), null);
  assert.equal(matchSubstation({...p, poi: "Proposed Whirlwind Substation"}, [f]), null);
  assert.equal(matchSubstation({...p, poi: "Whirlwind - Vincent Line"}, [f]), null);
});

test("source archive validates and survives restoration without duplicate observations", async () => {
  const source = path.resolve("assets/data/queue");
  const index = await validateQueueArchive(source);
  assert.ok(index.snapshots.length >= 1);
  const baseline = JSON.parse(await readFile(path.join(source, index.snapshots[0].file), "utf8"));
  validateQueueSnapshot(baseline);
  assert.throws(() => validateQueueSnapshot({...baseline, projects: [baseline.projects[0], baseline.projects[0]]}), /unique project/);
  assert.throws(() => validateQueueSnapshot({...baseline, projects: [{...baseline.projects[0], netMw: "500"}]}), /net MW/);
  assert.throws(() => validateQueueIndex({...index, snapshots: [{...index.snapshots[0], file: "../escape.json"}]}), /snapshot path/);
  const temp = await mkdtemp(path.join(os.tmpdir(), "queue-store-test-"));
  try {
    await mergeQueueArchive(source, temp);
    await mergeQueueArchive(source, temp);
    assert.equal((await validateQueueArchive(temp)).snapshots.length, index.snapshots.length);
    await writeFile(path.join(temp, baseline.sources[0].file), "corrupted");
    await assert.rejects(validateQueueArchive(temp), /checksum/);
  } finally { await rm(temp, {recursive: true, force: true}); }
});
