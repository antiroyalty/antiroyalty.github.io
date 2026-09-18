const FIVE_MINUTES_MS = 300_000;
const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit",
});
const clockFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "America/Los_Angeles", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
});

export function pacificDate(date) {
  const parts = Object.fromEntries(dateFormatter.formatToParts(date).map(({ type, value }) => [type, value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function shiftDate(date, days) {
  validateDate(date);
  return new Date(Date.parse(`${date}T12:00:00Z`) + days * 86_400_000).toISOString().slice(0, 10);
}

export function validateDate(date) {
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)
    || !Number.isFinite(Date.parse(`${date}T00:00:00Z`))
    || new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date) {
    throw new TypeError(`Invalid trading date: ${date}`);
  }
}

// Enumerating UTC instants preserves both repeated hours and the missing spring hour.
export function dayIntervals(date) {
  validateDate(date);
  const midnightUtc = Date.parse(`${date}T00:00:00Z`);
  const intervals = [];
  for (let offset = 7 * 60; offset < 33 * 60; offset += 5) {
    const instant = new Date(midnightUtc + offset * 60_000);
    if (pacificDate(instant) === date) {
      intervals.push({ timestamp: instant.toISOString(), label: clockFormatter.format(instant) });
    }
  }
  return intervals;
}

export function rowsByTimestamp(rows, date) {
  // Outlook appends the next day's midnight forecast after 23:55. It is outside this dated file's day.
  if (["00:00", "24:00"].includes(rows.at(-1)?.Time) && rows.at(-2)?.Time === "23:55") rows = rows.slice(0, -1);
  const slots = new Map();
  for (const { timestamp, label } of dayIntervals(date)) {
    slots.set(label, [...(slots.get(label) ?? []), timestamp]);
  }
  const counts = new Map();
  for (const row of rows) counts.set(row.Time, (counts.get(row.Time) ?? 0) + 1);
  const seen = new Map();
  return new Map(rows.map((row) => {
    const candidates = slots.get(row.Time);
    if (!candidates || counts.get(row.Time) !== candidates.length) {
      throw new Error(`Invalid or ambiguous CAISO clock label ${date} ${row.Time}`);
    }
    const index = seen.get(row.Time) ?? 0;
    seen.set(row.Time, index + 1);
    return [candidates[index], row];
  }));
}

export { FIVE_MINUTES_MS };
