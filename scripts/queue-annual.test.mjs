import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {createHash} from "node:crypto";
import {validateAnnualQueueHistory} from "../assets/js/queue-data.js";

const base = new URL("../assets/data/queue-annual/", import.meta.url);
const history = JSON.parse(await readFile(new URL("index.json", base), "utf8"));

test("annual counts reconcile to audited records and original source workbooks", async () => {
  validateAnnualQueueHistory(history);
  const expectedCounts = [
    [2020, 346, 179, 1381, 0], [2021, 604, 194, 1472, 0],
    [2022, 495, 199, 1580, 0], [2023, 995, 198, 1630, 0],
    [2024, 638, 228, 1971, 0], [2025, 432, 235, 2200, 1],
  ];
  assert.deepEqual(history.editions.map(e => [e.year, e.counts.ACTIVE, e.counts.COMPLETED, e.counts.WITHDRAWN, e.counts.SUSPENDED]), expectedCounts);
  for (const edition of history.editions) {
    const {projects, year} = JSON.parse(await readFile(new URL(edition.recordsFile, base), "utf8"));
    assert.equal(year, edition.year);
    assert.equal(new Set(projects.map(p => p.id)).size, projects.length);
    assert.equal(projects.length, edition.total);
    const counts = {ACTIVE: 0, COMPLETED: 0, WITHDRAWN: 0, SUSPENDED: 0};
    const mapping = {active: "ACTIVE", completed: "COMPLETED", operational: "COMPLETED", withdrawn: "WITHDRAWN", suspended: "SUSPENDED"};
    for (const project of projects) {
      assert.equal(project.status, mapping[project.rawStatus]);
      assert.ok(edition.source.sheets.includes(project.sourceSheet));
      assert.ok(Number.isInteger(project.sourceRow) && project.sourceRow >= 2);
      counts[project.status]++;
    }
    assert.deepEqual(counts, edition.counts);
    const bytes = await readFile(new URL(edition.source.file, base));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), edition.source.sha256);
  }
});

test("annual validation rejects missing statuses, false totals, ordering and unsafe paths", () => {
  for (const mutate of [
    h => { delete h.editions[0].counts.SUSPENDED; },
    h => { h.editions[0].counts.ACTIVE = -1; },
    h => { h.editions[0].total++; },
    h => { h.editions.reverse(); },
    h => { h.editions[0].asOf = "2021-01-01"; },
    h => { h.editions[0].source.file = "sources/../../secret.xlsx"; },
  ]) {
    const changed = structuredClone(history);
    mutate(changed);
    assert.throws(() => validateAnnualQueueHistory(changed), /Invalid queue data/);
  }
});
