import { validateElectricitySnapshot } from "./electricity-desk-schema.js";

const desk = document.querySelector("[data-electricity-desk]");

if (desk) {
  const endpoint = desk.dataset.endpoint;
  const formatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
  let lastSnapshot = null;
  let lastRefreshFailed = false;
  let lastRefreshAttempt = 0;

  function field(name) {
    return desk.querySelector(`[data-field="${name}"]`);
  }

  function setField(name, value) {
    const element = field(name);
    if (element) element.textContent = value;
  }

  function formatMw(value, signed = false) {
    if (!Number.isFinite(value)) return "n/a";
    const sign = signed && value > 0 ? "+" : "";
    return `${sign}${formatter.format(value)} MW`;
  }

  function ageLabel(minutes) {
    if (minutes < 2) return "updated just now";
    if (minutes < 60) return `updated ${Math.round(minutes)} min ago`;
    const hours = Math.round(minutes / 60);
    return `updated ${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  }

  function statusFor(ageMinutes) {
    if (ageMinutes <= 45) return { key: "live", label: "Current" };
    if (ageMinutes <= 180) return { key: "delayed", label: "Delayed" };
    return { key: "stale", label: "Stale" };
  }

  function snapshotAge(snapshot) {
    const sourceTime = Date.parse(snapshot.sourceUpdatedAt ?? snapshot.generatedAt);
    if (!Number.isFinite(sourceTime)) throw new TypeError("Snapshot has no valid source time");
    return Math.max(0, (Date.now() - sourceTime) / 60_000);
  }

  function updateFreshness() {
    if (!lastSnapshot) return;
    const ageMinutes = snapshotAge(lastSnapshot);
    const sourceStatus = statusFor(ageMinutes);
    const status = lastRefreshFailed && sourceStatus.key === "live"
      ? { key: "delayed", label: "Refresh delayed" }
      : sourceStatus;
    const freshness = field("freshness");

    desk.dataset.status = status.key;
    setField("status", status.label);
    setField("freshness", ageLabel(ageMinutes));
    if (freshness) {
      freshness.title = new Date(lastSnapshot.sourceUpdatedAt).toLocaleString("en-US", {
        timeZone: "America/Los_Angeles",
        dateStyle: "medium",
        timeStyle: "short",
      });
    }
  }

  function trendCopy(value) {
    if (!Number.isFinite(value)) return "Hourly comparison unavailable";
    if (Math.abs(value) < 100) return "Nearly level with one hour ago";
    return `${formatter.format(Math.abs(value))} MW ${value > 0 ? "higher" : "lower"} than one hour ago`;
  }

  function renderMix(mix) {
    const byLabel = Object.fromEntries(mix.map((item) => [item.label, item]));
    const grouped = {
      solar: byLabel.solar?.share ?? 0,
      wind: byLabel.wind?.share ?? 0,
      gas: byLabel.naturalGas?.share ?? 0,
      imports: byLabel.imports?.share ?? 0,
    };
    grouped.other = Math.max(0, 100 - grouped.solar - grouped.wind - grouped.gas - grouped.imports);

    Object.entries(grouped).forEach(([name, share]) => {
      const segment = desk.querySelector(`[data-segment="${name}"]`);
      if (segment) {
        segment.style.width = `${share}%`;
        segment.title = `${name}: ${share.toFixed(1)}% of positive supply`;
      }
      const label = desk.querySelector(`[data-mix-label="${name}"]`);
      if (label) label.textContent = `${share.toFixed(1)}%`;
    });

    const ribbon = desk.querySelector(".supply-ribbon");
    if (ribbon) {
      ribbon.setAttribute("aria-label", `Positive supply mix: solar ${grouped.solar.toFixed(1)}%, wind ${grouped.wind.toFixed(1)}%, gas ${grouped.gas.toFixed(1)}%, imports ${grouped.imports.toFixed(1)}%, and other ${grouped.other.toFixed(1)}%`);
    }
  }

  function render(data) {
    validateElectricitySnapshot(data);
    lastSnapshot = data;
    lastRefreshFailed = false;
    const batteryVerb = data.supply.batteryState === "discharging"
      ? "supplying the grid"
      : data.supply.batteryState === "charging"
        ? "charging from the grid"
        : "nearly balanced";

    desk.setAttribute("aria-busy", "false");
    setField("interval", data.intervalLabel);
    setField("demand", formatMw(data.demand.currentMw));
    setField("demand-trend", trendCopy(data.demand.changeFromHourAgoMw));
    setField("forecast", `${formatMw(data.demand.hourAheadMw)} hour-ahead forecast`);
    setField("solar-wind-share", `${data.supply.solarWindShare.toFixed(1)}%`);
    setField("solar-wind", `${formatMw(data.supply.solarMw)} solar + ${formatMw(data.supply.windMw)} wind`);
    setField("battery", formatMw(data.supply.batteryMw, true));
    setField("battery-state", batteryVerb);
    renderMix(data.supply.mix);
    updateFreshness();
  }

  function showUnavailable() {
    if (lastSnapshot) {
      lastRefreshFailed = true;
      updateFreshness();
      return;
    }
    desk.dataset.status = "unavailable";
    desk.setAttribute("aria-busy", "false");
    setField("status", "Unavailable");
    setField("freshness", "No verified snapshot available");
  }

  async function refresh() {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12_000);
    lastRefreshAttempt = Date.now();
    try {
      const response = await fetch(`${endpoint}?_=${Date.now()}`, {
        cache: "no-store",
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`Snapshot returned ${response.status}`);
      render(await response.json());
    } catch (error) {
      console.error("Electricity Desk refresh failed", error);
      showUnavailable();
    } finally {
      window.clearTimeout(timeout);
    }
  }

  refresh();
  window.setInterval(refresh, 5 * 60 * 1000);
  window.setInterval(updateFreshness, 60 * 1000);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && Date.now() - lastRefreshAttempt > 5 * 60 * 1000) {
      refresh();
    }
  });
}
