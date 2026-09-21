const DAY_MS = 86400000;
export const DAYS_PER_YEAR = 365.2425;
export const CHANGE_FIELDS = {
  status: "Status", netMw: "Net MW to grid", components: "Technology / component MW",
  poi: "Connection point", county: "County", state: "State", utility: "Transmission owner",
  currentOnlineDate: "Current / requested online date", originalOnlineDate: "Original online date",
  queueDate: "Queue date", studyProcess: "Study process", studyRegion: "Study area",
  agreementStatus: "Agreement", deliverability: "Deliverability", name: "Name",
  withdrawnDate: "Withdrawal date", completedDate: "Completion date", applicationDate: "Application date",
};

export function validDate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}

function assert(condition, message) {
  if (!condition) throw new Error(`Invalid queue data: ${message}`);
}

export function validateSources(sources) {
  assert(Array.isArray(sources) && sources.length === 2, "source coverage");
  assert(new Set(sources.map(s => s.id)).size === 2, "duplicate sources");
  for (const s of sources) {
    assert(["legacy", "cluster15"].includes(s.id) && validDate(s.reportDate), "source date");
    assert(typeof s.url === "string" && s.url.startsWith("https://www.caiso.com/documents/"), "source URL");
    assert(/^[a-f0-9]{64}$/.test(s.sha256) && /^sources\/(legacy|cluster15)-[a-f0-9]{16}\.xlsx$/.test(s.file), "source file");
  }
  return sources;
}

export function validateQueueIndex(index) {
  assert(index?.schemaVersion === 1 && Array.isArray(index.snapshots) && index.snapshots.length > 0, "index");
  assert(Number.isFinite(Date.parse(index.checkedAt)), "check time");
  validateSources(index.latestSources);
  const ids = new Set();
  let previous = -Infinity;
  for (const entry of index.snapshots) {
    assert(/^\d{4}-\d{2}-\d{2}-[a-f0-9]{16}$/.test(entry.id) && entry.file === `snapshots/${entry.id}.json`, "snapshot path");
    const time = Date.parse(entry.collectedAt);
    assert(Number.isFinite(time) && time >= previous && !ids.has(entry.id), "snapshot ordering");
    previous = time;
    ids.add(entry.id);
  }
  return index;
}

export function validateQueueSnapshot(snapshot) {
  assert(snapshot?.schemaVersion === 1 && Array.isArray(snapshot.projects) && snapshot.projects.length > 0, "snapshot");
  validateSources(snapshot.sources);
  assert(Number.isFinite(Date.parse(snapshot.collectedAt)), "collection time");
  assert(/^[a-f0-9]{16}$/.test(snapshot.fingerprint) && /^\d{4}-\d{2}-\d{2}-[a-f0-9]{16}$/.test(snapshot.id), "snapshot identity");
  const ids = new Set();
  for (const p of snapshot.projects) {
    assert(typeof p.id === "string" && /^\d+[A-Za-z]*$/.test(p.id) && !ids.has(p.id), "unique project ID");
    ids.add(p.id);
    assert(["ACTIVE", "COMPLETED", "WITHDRAWN"].includes(p.status), "status");
    assert(snapshot.sources.some(s => s.id === p.sourceId), "project source");
    for (const key of ["name", "county", "state", "utility", "poi", "studyProcess", "studyRegion", "sourceSheet"]) {
      assert(typeof p[key] === "string", key);
    }
    assert(Number.isInteger(p.sourceRow) && p.sourceRow > 0, "source row");
    for (const key of ["queueDate", "applicationDate", "withdrawnDate", "completedDate", "originalOnlineDate", "currentOnlineDate"]) {
      assert(p[key] === null || validDate(p[key]), key);
    }
    for (const key of ["agreementStatus", "deliverability"]) assert(p[key] === null || typeof p[key] === "string", key);
    assert(p.netMw === null || (Number.isFinite(p.netMw) && p.netMw >= 0), "net MW");
    assert(Array.isArray(p.components), "components");
    for (const c of p.components) assert(typeof c.fuel === "string" && (c.capacityMw === null || (Number.isFinite(c.capacityMw) && c.capacityMw >= 0)), "component MW");
  }
  return snapshot;
}

export function technology(project) {
  const categories = new Set(project.components.map(component => {
    const fuel = component.fuel.toLowerCase();
    if (/battery|storage|compressed air|flywheel|gravity/.test(fuel)) return "Storage";
    if (/solar|photovoltaic/.test(fuel)) return "Solar";
    if (/wind/.test(fuel)) return "Wind";
    if (/natural gas/.test(fuel)) return "Gas";
    if (/geothermal/.test(fuel)) return "Geothermal";
    if (/hydro|water/.test(fuel)) return "Hydro";
    if (/biofuel|biomass/.test(fuel)) return "Bioenergy";
    if (/nuclear/.test(fuel)) return "Nuclear";
    if (/hydrogen/.test(fuel)) return "Hydrogen";
    return "Other / unspecified";
  }));
  if (categories.size === 2 && categories.has("Storage") && categories.has("Solar")) return "Solar + storage";
  if (categories.size === 2 && categories.has("Storage") && categories.has("Wind")) return "Wind + storage";
  if (categories.size > 1) return "Other hybrid";
  return [...categories][0] || "Other / unspecified";
}

export function queueDays(project, reportDate) {
  const end = project.status === "ACTIVE" ? reportDate : project.status === "COMPLETED" ? project.completedDate : project.withdrawnDate;
  if (!validDate(project.queueDate) || !validDate(end)) return null;
  const days = (Date.parse(end) - Date.parse(project.queueDate)) / DAY_MS;
  return days >= 0 ? days : null;
}

export function median(values) {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length ? (sorted[mid] + sorted[Math.floor((sorted.length - 1) / 2)]) / 2 : null;
}

// Equal-width, lower-inclusive intervals; retain empty bins through the oldest project.
export function isInQueueAgeBin(days, bin) {
  return Number.isFinite(days) && days >= bin.fromYears * DAYS_PER_YEAR && days < bin.toYears * DAYS_PER_YEAR;
}

export function queueAgeHistogram(daysValues) {
  const knownDays = daysValues.filter(days => Number.isFinite(days) && days >= 0);
  if (!knownDays.length) return [];
  const intervalDays = 2 * DAYS_PER_YEAR;
  const binCount = Math.floor(Math.max(...knownDays) / intervalDays) + 1;
  const bins = Array.from({length: binCount}, (_, index) => ({
    fromYears: index * 2, toYears: (index + 1) * 2, count: 0,
  }));
  knownDays.forEach(days => { bins[Math.floor(days / intervalDays)].count++; });
  return bins;
}

export function countyLabel(value) {
  const normalized = value.trim().replace(/\bcounty\b/gi, "").replace(/\s+/g, " ").trim().toLowerCase();
  if (["", "n/a", "tbd"].includes(normalized)) return "Not reported";
  return normalized.replace(/\b\w/g, character => character.toUpperCase());
}

export function compareQueues(previous, current) {
  if (!previous) return null;
  const before = new Map(previous.projects.map(p => [p.id, p]));
  const after = new Map(current.projects.map(p => [p.id, p]));
  const changes = [];
  for (const p of current.projects) {
    const old = before.get(p.id);
    if (!old) changes.push({id: p.id, name: p.name, kind: "appeared", fields: []});
    else {
      const fields = Object.keys(CHANGE_FIELDS).filter(key => JSON.stringify(old[key]) !== JSON.stringify(p[key]))
        .map(key => ({key, before: old[key], after: p[key]}));
      if (fields.length) changes.push({id: p.id, name: p.name, kind: "updated", fields});
    }
  }
  for (const p of previous.projects) if (!after.has(p.id)) changes.push({id: p.id, name: p.name, kind: "absent", fields: []});
  return changes;
}

const owner = value => value.toUpperCase().replace(/[^A-Z]/g, "").replace("PGAE", "PGE");
const county = value => value.toUpperCase().replace(/ COUNTY\b/g, "").trim();
const station = value => value.toUpperCase().replace(/\b\d+(?:\.\d+)?\s*KV\b/g, "")
  .replace(/\b(SUBSTATION|SUB|SWITCHING STATION|SW STA|SWITCHYARD|BUS|PP)\b/g, "").replace(/[^A-Z0-9]/g, "");

// Exact normalized station, owner and county matches only. Never place a proposed line at a guessed point.
export function matchSubstation(project, features) {
  if (project.state !== "CA" || /line|proposed|conceptual|\s-\s/i.test(project.poi) || !station(project.poi)) return null;
  const matches = features.filter(f => f.geometry?.type === "Point" && Array.isArray(f.geometry.coordinates)
    && f.geometry.coordinates.length === 2 && f.geometry.coordinates.every(Number.isFinite)
    && station(f.properties?.Name || "") === station(project.poi)
    && owner(f.properties?.Owner || "") === owner(project.utility)
    && county(f.properties?.COUNTY || "") === county(project.county));
  return matches.length === 1 ? matches[0] : null;
}
