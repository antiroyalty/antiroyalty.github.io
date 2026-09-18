import { validateElectricitySnapshot } from "./electricity-desk-schema.js";
import { freshnessFor } from "./data-freshness.js";
import { validateGridMarketSnapshot } from "./grid-market-schema.js";

const explorer = document.querySelector("[data-grid-explorer]");
const PRICE_COLORS = {
  negative: "#547b9c",
  low: "#66836a",
  moderate: "#c2942f",
  high: "#a64e3d",
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function money(value, digits = 2) {
  if (!Number.isFinite(value)) return "n/a";
  const sign = value < 0 ? "−" : "";
  return `${sign}$${Math.abs(value).toFixed(digits)}/MWh`;
}

function megawatts(value, signed = false) {
  if (!Number.isFinite(value)) return "n/a";
  const sign = signed && value > 0 ? "+" : "";
  return `${sign}${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value)} MW`;
}

function pacificTime(timestamp) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(timestamp));
}

function priceColor(price) {
  if (price < 0) return PRICE_COLORS.negative;
  if (price < 30) return PRICE_COLORS.low;
  if (price <= 80) return PRICE_COLORS.moderate;
  return PRICE_COLORS.high;
}

async function fetchJson(url, timeoutMs = 15_000) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${url}?_=${Date.now()}`, { cache: "no-store", signal: controller.signal });
    if (!response.ok) throw new Error(`${url} returned ${response.status}`);
    return response.json();
  } finally {
    window.clearTimeout(timeout);
  }
}

class CaliforniaGridExplorer {
  constructor(root) {
    this.root = root;
    this.map = null;
    this.market = null;
    this.desk = null;
    this.marketRefreshFailed = false;
    this.deskRefreshFailed = false;
    this.selectedHub = null;
    this.refreshing = false;
    this.layers = {};
    this.hubMarkers = new Map();
    this.init();
  }

  field(name) {
    return this.root.querySelector(`[data-grid-field="${name}"]`);
  }

  setField(name, value) {
    const element = this.field(name);
    if (element) element.textContent = value;
  }

  async init() {
    if (typeof window.L === "undefined") {
      this.showUnavailable("Map library unavailable");
      return;
    }
    this.createMap();
    this.bindControls();

    const infrastructure = Promise.all([
      fetchJson(this.root.dataset.linesEndpoint, 25_000),
      fetchJson(this.root.dataset.substationsEndpoint, 25_000),
    ]).then(([lines, substations]) => this.renderInfrastructure(lines, substations));

    const market = this.refreshData();
    window.setInterval(() => this.refreshData(), 5 * 60_000);
    window.setInterval(() => this.updateFreshness(), 60_000);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") { this.updateFreshness(); this.refreshData(); }
    });

    try {
      await Promise.all([infrastructure, market]);
      this.root.dataset.status = "ready";
      this.root.querySelector(".grid-loading")?.remove();
    } catch (error) {
      console.error("Grid infrastructure unavailable", error);
      this.showUnavailable("Public infrastructure unavailable");
    }
  }

  async refreshData() {
    if (this.refreshing) return;
    this.refreshing = true;
    try {
      await Promise.all([
        fetchJson(this.root.dataset.marketEndpoint).then((data) => {
          const snapshot = validateGridMarketSnapshot(data);
          if (this.market && Date.parse(snapshot.sourceUpdatedAt) < Date.parse(this.market.sourceUpdatedAt)) throw new Error("Market snapshot moved backwards");
          this.marketRefreshFailed = false;
          this.renderMarket(snapshot);
        }).catch((error) => { this.marketRefreshFailed = true; console.error("Market refresh failed", error); }),
        fetchJson(this.root.dataset.deskEndpoint).then((data) => {
          const snapshot = validateElectricitySnapshot(data);
          if (this.desk && Date.parse(snapshot.sourceUpdatedAt) < Date.parse(this.desk.sourceUpdatedAt)) throw new Error("Electricity snapshot moved backwards");
          this.desk = snapshot;
          this.deskRefreshFailed = false;
          this.renderDesk(snapshot);
        }).catch((error) => { this.deskRefreshFailed = true; console.error("Electricity refresh failed", error); }),
      ]);
    } finally { this.refreshing = false; this.updateFreshness(); }
  }

  updateFreshness() {
    const marketStatus = freshnessFor(this.market, Date.now(), this.marketRefreshFailed);
    this.root.dataset.marketStatus = marketStatus.key;
    this.setField("status", marketStatus.label);
    if (this.market) this.setField("interval", `Price interval ${pacificTime(this.market.sourceUpdatedAt)}`);
    const deskStatus = freshnessFor(this.desk, Date.now(), this.deskRefreshFailed);
    if (this.desk) {
      this.renderDesk(this.desk);
      const suffix = ` · ${deskStatus.label} · ${pacificTime(this.desk.sourceUpdatedAt)}`;
      ["demand-detail", "battery-detail"].forEach((name) => { this.field(name).textContent += suffix; });
    } else {
      this.setField("demand", "n/a"); this.setField("battery", "n/a");
      this.setField("demand-detail", "Demand unavailable"); this.setField("battery-detail", "Storage unavailable");
    }
  }

  createMap() {
    this.map = L.map("grid-map", {
      center: [36.8, -119.5],
      zoom: 6,
      minZoom: 5,
      maxZoom: 11,
      zoomControl: false,
      preferCanvas: true,
    });
    L.control.zoom({ position: "bottomright" }).addTo(this.map);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 11,
      attribution: "&copy; OpenStreetMap contributors",
      className: "grid-base-tiles",
    }).addTo(this.map);
    this.map.fitBounds([[32.45, -124.5], [42.05, -114.0]], { padding: [18, 18] });
  }

  bindControls() {
    this.root.querySelectorAll("[data-grid-layer]").forEach((input) => {
      input.addEventListener("change", () => {
        const layer = this.layers[input.dataset.gridLayer];
        if (!layer) return;
        if (input.checked) layer.addTo(this.map);
        else this.map.removeLayer(layer);
      });
    });
    this.root.querySelectorAll("[data-grid-hub]").forEach((button) => {
      button.addEventListener("click", () => this.selectHub(button.dataset.gridHub, true));
    });
  }

  renderInfrastructure(lines, substations) {
    if (lines?.type !== "FeatureCollection" || substations?.type !== "FeatureCollection") {
      throw new TypeError("CEC infrastructure data is not valid GeoJSON");
    }
    const linePopup = (feature) => {
      const props = feature.properties ?? {};
      const title = props.TLine_Name?.trim() || props.Name?.trim() || "Transmission segment";
      return `<div class="grid-popup"><strong>${escapeHtml(title)}</strong><dl><div><dt>Voltage</dt><dd>${escapeHtml(props.kV)} kV</dd></div><div><dt>Owner</dt><dd>${escapeHtml(props.Owner || "Not listed")}</dd></div><div><dt>Circuit</dt><dd>${escapeHtml(props.Circuit || "Not listed")}</dd></div></dl><small>Approximate CEC public geometry</small></div>`;
    };
    const lineOptions = (feature) => {
      const voltage = Number(feature.properties?.kV_Sort) || 0;
      return voltage >= 345
        ? { color: "#9b4b3d", weight: 2.6, opacity: 0.72 }
        : { color: "#456b79", weight: 1.35, opacity: 0.48 };
    };
    const lowerLines = { ...lines, features: lines.features.filter((feature) => Number(feature.properties?.kV_Sort) < 345) };
    const higherLines = { ...lines, features: lines.features.filter((feature) => Number(feature.properties?.kV_Sort) >= 345) };
    this.layers["lower-voltage"] = L.geoJSON(lowerLines, {
      style: lineOptions,
      onEachFeature: (feature, layer) => layer.bindPopup(linePopup(feature)),
    }).addTo(this.map);
    this.layers["higher-voltage"] = L.geoJSON(higherLines, {
      style: lineOptions,
      onEachFeature: (feature, layer) => layer.bindPopup(linePopup(feature)),
    }).addTo(this.map);

    this.layers.substations = L.geoJSON(substations, {
      pointToLayer: (feature, latlng) => L.circleMarker(latlng, {
        radius: Number(feature.properties?.Max_Voltag) >= 500 ? 4.2 : 3,
        color: "#173f78",
        weight: 1,
        fillColor: "#f3eee5",
        fillOpacity: 0.9,
      }),
      onEachFeature: (feature, layer) => {
        const props = feature.properties ?? {};
        layer.bindPopup(`<div class="grid-popup"><strong>${escapeHtml(props.Name || "Substation")}</strong><dl><div><dt>Voltage</dt><dd>${escapeHtml(props.Max_Voltag)} kV</dd></div><div><dt>Owner</dt><dd>${escapeHtml(props.Owner || "Not listed")}</dd></div><div><dt>Place</dt><dd>${escapeHtml([props.CITY, props.COUNTY].filter(Boolean).join(", ") || "Not listed")}</dd></div></dl><small>CEC / HIFLD public data</small></div>`);
      },
    });
  }

  renderMarket(snapshot) {
    this.market = snapshot;
    if (this.layers.prices) this.map.removeLayer(this.layers.prices);
    this.hubMarkers.clear();
    this.layers.prices = L.layerGroup();
    if (this.root.querySelector('[data-grid-layer="prices"]').checked) this.layers.prices.addTo(this.map);
    snapshot.hubs.forEach((hub) => {
      const color = priceColor(hub.lmp);
      const marker = L.circleMarker(hub.coordinates, {
        radius: 14,
        color: "#f3eee5",
        weight: 3,
        fillColor: color,
        fillOpacity: 0.96,
        className: "grid-price-marker",
      });
      marker.bindTooltip(`<strong>${escapeHtml(hub.id)}</strong> ${escapeHtml(money(hub.lmp))}`, {
        permanent: true,
        direction: "right",
        offset: [13, 0],
        className: "grid-price-label",
      });
      marker.on("click", () => this.selectHub(hub.id));
      marker.addTo(this.layers.prices);
      this.hubMarkers.set(hub.id, marker);
      const priceElement = this.root.querySelector(`[data-hub-price="${hub.id}"]`);
      if (priceElement) priceElement.textContent = money(hub.lmp);
    });

    const spread = snapshot.insight.northSouthSpread;
    this.setField("spread", `${spread < 0 ? "−" : ""}$${Math.abs(spread).toFixed(2)}/MWh`);
    this.setField("spread-direction", spread === 0 ? "SP15 level with NP15" : `SP15 ${spread > 0 ? "above" : "below"} NP15`);
    this.field("interval").title = snapshot.interval.label;
    this.setField("insight-title", Math.abs(spread) < 2 ? "California is broadly aligned" : "Prices are separating across California");
    this.setField("insight-summary", snapshot.insight.summary);
    this.setField("insight-driver", snapshot.insight.driver);
    if (this.selectedHub) this.selectHub(this.selectedHub);
    this.updateFreshness();
  }

  renderDesk(snapshot) {
    this.setField("demand", megawatts(snapshot?.demand?.currentMw));
    const trend = snapshot?.demand?.changeFromHourAgoMw;
    this.setField("demand-detail", Number.isFinite(trend)
      ? `${new Intl.NumberFormat("en-US").format(Math.abs(trend))} MW ${trend >= 0 ? "above" : "below"} one hour ago`
      : "Hourly comparison unavailable");
    const battery = snapshot?.supply?.batteryMw;
    this.setField("battery", megawatts(battery, true));
    this.setField("battery-detail", snapshot?.supply?.batteryState === "charging"
      ? "charging from the grid"
      : snapshot?.supply?.batteryState === "discharging"
        ? "supplying the grid"
        : snapshot?.supply?.batteryState === "balanced" ? "nearly balanced" : "Storage measurement unavailable");
  }

  selectHub(id, pan = false) {
    const hub = this.market?.hubs.find((item) => item.id === id);
    if (!hub) return;
    this.selectedHub = id;
    this.root.querySelectorAll("[data-grid-hub]").forEach((button) => {
      button.classList.toggle("is-selected", button.dataset.gridHub === id);
      button.setAttribute("aria-pressed", button.dataset.gridHub === id ? "true" : "false");
    });
    const detail = this.root.querySelector("[data-grid-detail]");
    if (detail) detail.hidden = false;
    this.root.querySelector('[data-grid-detail="name"]').textContent = `${hub.id} · ${hub.region}`;
    this.root.querySelector('[data-grid-detail="price"]').textContent = money(hub.lmp);
    ["energy", "congestion", "loss", "ghg"].forEach((key) => {
      this.root.querySelector(`[data-grid-detail="${key}"]`).textContent = money(hub.components[key]);
    });
    if (pan) {
      this.map.flyTo(hub.coordinates, Math.max(this.map.getZoom(), 7), { duration: 0.65 });
      this.hubMarkers.get(id)?.openTooltip();
    }
  }

  showUnavailable(message) {
    const loading = this.root.querySelector(".grid-loading");
    if (loading) loading.textContent = message;
    this.root.dataset.marketStatus = "unavailable";
    this.setField("status", message);
  }
}

if (explorer) new CaliforniaGridExplorer(explorer);
