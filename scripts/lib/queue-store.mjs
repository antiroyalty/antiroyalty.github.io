import { readFile, cp, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { validateQueueIndex, validateQueueSnapshot } from "../../assets/js/queue-data.js";
import { readJson, writeJson } from "./data-store.mjs";

export async function validateQueueArchive(directory) {
  const index = await readJson(path.join(directory, "index.json"));
  if (!index) return null;
  validateQueueIndex(index);
  const sources = [...index.latestSources];
  for (const entry of index.snapshots) {
    const snapshot = validateQueueSnapshot(await readJson(path.join(directory, entry.file)));
    if (snapshot.id !== entry.id || snapshot.collectedAt !== entry.collectedAt) throw new Error("Queue index / snapshot mismatch");
    sources.push(...snapshot.sources);
  }
  const checked = new Set();
  for (const source of sources) {
    if (checked.has(source.file)) continue;
    const bytes = await readFile(path.join(directory, source.file));
    if (createHash("sha256").update(bytes).digest("hex") !== source.sha256) throw new Error(`Queue source checksum mismatch: ${source.file}`);
    checked.add(source.file);
  }
  return index;
}

export async function mergeQueueArchive(from, to) {
  const saved = await validateQueueArchive(from);
  const local = await validateQueueArchive(to);
  if (!saved) return;
  await mkdir(to, {recursive: true});
  const entries = new Map((local?.snapshots || []).map(e => [e.id, e]));
  for (const entry of saved.snapshots) {
    if (entries.has(entry.id)) {
      const a = await readFile(path.join(from, entry.file));
      const b = await readFile(path.join(to, entry.file));
      if (!a.equals(b)) throw new Error("Conflicting immutable queue snapshots");
    } else {
      await mkdir(path.join(to, "snapshots"), {recursive: true});
      await cp(path.join(from, entry.file), path.join(to, entry.file));
      entries.set(entry.id, entry);
    }
  }
  await cp(path.join(from, "sources"), path.join(to, "sources"), {recursive: true});
  const latest = !local || Date.parse(saved.checkedAt) > Date.parse(local.checkedAt) ? saved : local;
  const merged = {...latest, snapshots: [...entries.values()].sort((a, b) => Date.parse(a.collectedAt) - Date.parse(b.collectedAt))};
  await writeJson(path.join(to, "index.json"), validateQueueIndex(merged));
  await validateQueueArchive(to);
}
