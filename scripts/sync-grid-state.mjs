import { cp, mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DATASETS, readJson, writeJson, validateDay, saveRecords, writeHistoryIndex } from "./lib/data-store.mjs";
import { validateQueueArchive, mergeQueueArchive } from "./lib/queue-store.mjs";

export async function validateState(directory) {
  await validateQueueArchive(path.join(directory, "queue"));
  for (const [dataset, spec] of Object.entries(DATASETS)) {
    const latest = await readJson(path.join(directory, spec.file));
    if (latest) spec.validate(latest);
    const folder = path.join(directory, "history", dataset);
    const files = await readdir(folder).catch((error) => { if (error.code === "ENOENT") return []; throw error; });
    for (const file of files) {
      if (!/^\d{4}-\d{2}-\d{2}\.json$/.test(file)) throw new Error(`Unexpected history file: ${file}`);
      validateDay(await readJson(path.join(folder, file)), dataset, file.slice(0, 10));
    }
  }
}

export async function restoreState(stateDir, dataDir = "assets/data") {
  await validateState(stateDir);
  await mergeQueueArchive(path.join(stateDir, "queue"), path.join(dataDir, "queue"));
  for (const [dataset, spec] of Object.entries(DATASETS)) {
    const saved = await readJson(path.join(stateDir, spec.file));
    const local = await readJson(path.join(dataDir, spec.file));
    if (local) spec.validate(local);
    if (saved && (!local || (Date.parse(saved.sourceUpdatedAt) > Date.parse(local.sourceUpdatedAt)
      || (saved.sourceUpdatedAt === local.sourceUpdatedAt && Date.parse(saved.generatedAt) >= Date.parse(local.generatedAt))))) {
      await writeJson(path.join(dataDir, spec.file), saved);
    }
    const folder = path.join(stateDir, "history", dataset);
    const files = await readdir(folder).catch((error) => { if (error.code === "ENOENT") return []; throw error; });
    for (const file of files) {
      const day = await readJson(path.join(folder, file));
      await saveRecords(dataset, day.tradingDate, day.records, dataDir);
    }
  }
  await writeHistoryIndex(dataDir);
}

export async function persistState(stateDir, dataDir = "assets/data") {
  await validateState(dataDir);
  await writeHistoryIndex(dataDir);
  await mkdir(stateDir, { recursive: true });
  for (const spec of Object.values(DATASETS)) {
    const snapshot = await readJson(path.join(dataDir, spec.file));
    if (!snapshot) throw new Error(`Cannot persist without ${spec.file}`);
    await writeJson(path.join(stateDir, spec.file), snapshot);
  }
  await cp(path.join(dataDir, "history"), path.join(stateDir, "history"), { recursive: true });
  await mergeQueueArchive(path.join(dataDir, "queue"), path.join(stateDir, "queue"));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [mode, directory] = process.argv.slice(2);
  if (!directory || !["restore", "persist", "validate"].includes(mode)) throw new Error("Usage: sync-grid-state.mjs restore|persist|validate DIRECTORY");
  if (mode === "restore") await restoreState(directory);
  if (mode === "persist") await persistState(directory);
  if (mode === "validate") await validateState(directory);
}
