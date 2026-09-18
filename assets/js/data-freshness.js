// Age is measured from the source interval, never from a file's publication time.
export function freshnessFor(snapshot, nowMs = Date.now(), refreshFailed = false) {
  const intervalMs = Date.parse(snapshot?.intervalTimeUtc ?? snapshot?.sourceUpdatedAt);
  if (!Number.isFinite(intervalMs) || intervalMs > nowMs + 300_000) return { key: "unavailable", label: "Unavailable", ageMinutes: null };
  const ageMinutes = Math.max(0, (nowMs - intervalMs) / 60_000);
  if (ageMinutes > 180) return { key: "stale", label: "Stale", ageMinutes };
  if (ageMinutes > 45 || refreshFailed) return { key: "delayed", label: refreshFailed ? "Refresh delayed" : "Delayed", ageMinutes };
  return { key: "live", label: "Current", ageMinutes };
}
