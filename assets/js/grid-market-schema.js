const HUB_IDS = ["NP15", "SP15", "ZP26"];
const COMPONENT_KEYS = ["energy", "congestion", "loss"];

function requireObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${label} must be an object`);
  }
}

function requireFinite(value, label) {
  if (!Number.isFinite(value)) throw new TypeError(`${label} must be finite`);
}

function requireText(value, label) {
  if (typeof value !== "string" || !value.trim()) throw new TypeError(`${label} must be text`);
}

export function validateGridMarketSnapshot(snapshot) {
  requireObject(snapshot, "snapshot");
  if (snapshot.schemaVersion !== 1) throw new TypeError("snapshot schemaVersion must be 1");
  if (!Number.isFinite(Date.parse(snapshot.generatedAt))) {
    throw new TypeError("snapshot generatedAt must be a valid timestamp");
  }
  if (!Number.isFinite(Date.parse(snapshot.sourceUpdatedAt))) {
    throw new TypeError("snapshot sourceUpdatedAt must be a valid timestamp");
  }

  requireObject(snapshot.interval, "snapshot interval");
  requireText(snapshot.interval.tradingDate, "interval tradingDate");
  requireFinite(snapshot.interval.hourEnding, "interval hourEnding");
  requireFinite(snapshot.interval.fiveMinuteInterval, "interval fiveMinuteInterval");
  if (snapshot.interval.hourEnding < 1 || snapshot.interval.hourEnding > 25) {
    throw new TypeError("interval hourEnding must be between 1 and 25");
  }
  if (snapshot.interval.fiveMinuteInterval < 1 || snapshot.interval.fiveMinuteInterval > 12) {
    throw new TypeError("interval fiveMinuteInterval must be between 1 and 12");
  }
  requireText(snapshot.interval.label, "interval label");

  requireObject(snapshot.source, "snapshot source");
  requireText(snapshot.source.name, "source name");
  requireText(snapshot.source.url, "source url");

  if (!Array.isArray(snapshot.hubs) || snapshot.hubs.length !== HUB_IDS.length) {
    throw new TypeError(`snapshot hubs must contain ${HUB_IDS.length} records`);
  }
  const byId = new Map(snapshot.hubs.map((hub) => [hub.id, hub]));
  HUB_IDS.forEach((id) => {
    const hub = byId.get(id);
    requireObject(hub, `hub ${id}`);
    requireText(hub.name, `hub ${id} name`);
    requireText(hub.region, `hub ${id} region`);
    if (!Array.isArray(hub.coordinates) || hub.coordinates.length !== 2) {
      throw new TypeError(`hub ${id} coordinates must be [latitude, longitude]`);
    }
    hub.coordinates.forEach((value, index) => requireFinite(value, `hub ${id} coordinate ${index}`));
    requireFinite(hub.lmp, `hub ${id} LMP`);
    requireObject(hub.components, `hub ${id} components`);
    COMPONENT_KEYS.forEach((key) => requireFinite(hub.components[key], `hub ${id} ${key}`));
    const componentTotal = COMPONENT_KEYS.reduce((sum, key) => sum + hub.components[key], 0);
    if (Math.abs(componentTotal - hub.lmp) > 0.2) {
      throw new TypeError(`hub ${id} components do not reconcile with LMP`);
    }
  });

  requireObject(snapshot.insight, "snapshot insight");
  requireFinite(snapshot.insight.northSouthSpread, "north-south spread");
  requireText(snapshot.insight.summary, "insight summary");
  requireText(snapshot.insight.driver, "insight driver");
  return snapshot;
}

export { HUB_IDS };
