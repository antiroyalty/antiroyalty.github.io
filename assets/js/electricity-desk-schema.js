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
  if (![1, 2].includes(snapshot.schemaVersion)) {
    throw new TypeError("snapshot.schemaVersion must be 1 or 2");
  }

  assertTimestamp(snapshot.generatedAt, "snapshot.generatedAt");
  assertTimestamp(snapshot.sourceUpdatedAt, "snapshot.sourceUpdatedAt");
  assertString(snapshot.intervalLabel, "snapshot.intervalLabel");

  assertObject(snapshot.source, "snapshot.source");
  assertString(snapshot.source.name, "snapshot.source.name");
  assertString(snapshot.source.url, "snapshot.source.url");
  assertString(snapshot.source.cadence, "snapshot.source.cadence");
  assertString(snapshot.source.note, "snapshot.source.note");

  const nullable = snapshot.schemaVersion === 2;
  if (nullable) {
    assertTimestamp(snapshot.intervalTimeUtc, "snapshot.intervalTimeUtc");
    if (Date.parse(snapshot.intervalTimeUtc) % 300_000 !== 0) throw new TypeError("Invalid five-minute electricity interval");
    if (snapshot.sourceUpdatedAt !== snapshot.intervalTimeUtc) throw new TypeError("Freshness must use the measurement interval");
  }
  assertObject(snapshot.demand, "snapshot.demand");
  assertNumber(snapshot.demand.currentMw, "snapshot.demand.currentMw", { min: 1 });
  assertNumber(snapshot.demand.hourAheadMw, "snapshot.demand.hourAheadMw", { nullable, min: 1 });
  assertNumber(snapshot.demand.dayAheadPeakMw, "snapshot.demand.dayAheadPeakMw", { nullable: true, min: 1 });
  assertNumber(snapshot.demand.changeFromHourAgoMw, "snapshot.demand.changeFromHourAgoMw", { nullable: true });

  assertObject(snapshot.supply, "snapshot.supply");
  assertNumber(snapshot.supply.solarMw, "snapshot.supply.solarMw", { nullable });
  assertNumber(snapshot.supply.windMw, "snapshot.supply.windMw", { nullable });
  assertNumber(snapshot.supply.solarWindShare, "snapshot.supply.solarWindShare", { nullable });
  assertNumber(snapshot.supply.batteryMw, "snapshot.supply.batteryMw", { nullable });
  if (!(nullable && snapshot.supply.batteryMw === null && snapshot.supply.batteryState === "unavailable")
    && !["charging", "discharging", "balanced"].includes(snapshot.supply.batteryState)) {
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
    assertNumber(entry.mw, `${path}.mw`, { nullable, min: 0 });
    assertNumber(entry.share, `${path}.share`, { nullable, min: 0, max: 100 });
    if (labels.has(entry.label) || !MIX_LABELS.includes(entry.label)) throw new TypeError("Duplicate or unknown mix label");
    labels.add(entry.label);
  });
  MIX_LABELS.forEach((label) => {
    if (!labels.has(label)) throw new TypeError(`snapshot.supply.mix is missing ${label}`);
  });

  if (nullable) {
    const supply = snapshot.supply;
    const expectedState = supply.batteryMw === null ? "unavailable"
      : supply.batteryMw > 50 ? "discharging" : supply.batteryMw < -50 ? "charging" : "balanced";
    if (supply.batteryState !== expectedState) throw new TypeError("Battery state disagrees with power");
    const expectedShare = supply.solarMw === null || supply.windMw === null ? null
      : Number(((supply.solarMw + supply.windMw) / snapshot.demand.currentMw * 100).toFixed(1));
    if (supply.solarWindShare !== expectedShare) throw new TypeError("Solar/wind share disagrees with measurements");
    const complete = supply.mix.every((entry) => entry.mw !== null);
    const total = complete ? supply.mix.reduce((sum, entry) => sum + entry.mw, 0) : null;
    for (const entry of supply.mix) {
      const share = total > 0 ? Number((entry.mw / total * 100).toFixed(1)) : null;
      if (entry.share !== share) throw new TypeError("Supply shares must reconcile or remain unavailable");
    }
  }
  return snapshot;
}
