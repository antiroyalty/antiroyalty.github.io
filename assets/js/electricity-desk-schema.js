const MIX_LABELS = [
  "solar",
  "wind",
  "naturalGas",
  "hydro",
  "nuclear",
  "batteries",
  "imports",
  "other",
];

function assertObject(value, path) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${path} must be an object`);
  }
}

function assertString(value, path) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeError(`${path} must be a non-empty string`);
  }
}

function assertNumber(value, path, { nullable = false, min = -Infinity, max = Infinity } = {}) {
  if (nullable && value === null) return;
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new TypeError(`${path} must be a finite number between ${min} and ${max}`);
  }
}

function assertTimestamp(value, path) {
  assertString(value, path);
  if (!Number.isFinite(Date.parse(value))) {
    throw new TypeError(`${path} must be a valid timestamp`);
  }
}

export function validateElectricitySnapshot(snapshot) {
  assertObject(snapshot, "snapshot");
  if (snapshot.schemaVersion !== 1) {
    throw new TypeError("snapshot.schemaVersion must be 1");
  }

  assertTimestamp(snapshot.generatedAt, "snapshot.generatedAt");
  assertTimestamp(snapshot.sourceUpdatedAt, "snapshot.sourceUpdatedAt");
  assertString(snapshot.intervalLabel, "snapshot.intervalLabel");

  assertObject(snapshot.source, "snapshot.source");
  assertString(snapshot.source.name, "snapshot.source.name");
  assertString(snapshot.source.url, "snapshot.source.url");
  assertString(snapshot.source.cadence, "snapshot.source.cadence");
  assertString(snapshot.source.note, "snapshot.source.note");

  assertObject(snapshot.demand, "snapshot.demand");
  assertNumber(snapshot.demand.currentMw, "snapshot.demand.currentMw", { min: 1 });
  assertNumber(snapshot.demand.hourAheadMw, "snapshot.demand.hourAheadMw", { min: 1 });
  assertNumber(snapshot.demand.dayAheadPeakMw, "snapshot.demand.dayAheadPeakMw", { nullable: true, min: 1 });
  assertNumber(snapshot.demand.changeFromHourAgoMw, "snapshot.demand.changeFromHourAgoMw", { nullable: true });

  assertObject(snapshot.supply, "snapshot.supply");
  assertNumber(snapshot.supply.solarMw, "snapshot.supply.solarMw", { min: 0 });
  assertNumber(snapshot.supply.windMw, "snapshot.supply.windMw", { min: 0 });
  assertNumber(snapshot.supply.solarWindShare, "snapshot.supply.solarWindShare", { min: 0 });
  assertNumber(snapshot.supply.batteryMw, "snapshot.supply.batteryMw");
  if (!["charging", "discharging", "balanced"].includes(snapshot.supply.batteryState)) {
    throw new TypeError("snapshot.supply.batteryState is invalid");
  }

  if (!Array.isArray(snapshot.supply.mix)) {
    throw new TypeError("snapshot.supply.mix must be an array");
  }
  const labels = new Set();
  snapshot.supply.mix.forEach((entry, index) => {
    const path = `snapshot.supply.mix[${index}]`;
    assertObject(entry, path);
    assertString(entry.label, `${path}.label`);
    assertNumber(entry.mw, `${path}.mw`, { min: 0 });
    assertNumber(entry.share, `${path}.share`, { min: 0, max: 100 });
    labels.add(entry.label);
  });
  MIX_LABELS.forEach((label) => {
    if (!labels.has(label)) throw new TypeError(`snapshot.supply.mix is missing ${label}`);
  });

  return snapshot;
}
