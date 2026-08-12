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

    const market = fetchJson(this.root.dataset.marketEndpoint)
      .then((snapshot) => this.renderMarket(validateGridMarketSnapshot(snapshot)))
      .catch((error) => {
        console.error("Grid market snapshot unavailable", error);
        this.showUnavailable("Market snapshot unavailable");
      });

    const desk = fetchJson(this.root.dataset.deskEndpoint)
      .then((snapshot) => this.renderDesk(snapshot))
      .catch((error) => console.error("Electricity Desk summary unavailable", error));

    try {
      await Promise.all([infrastructure, market, desk]);
      this.root.dataset.status = "ready";
      this.root.querySelector(".grid-loading")?.remove();
    } catch (error) {
      console.error("Grid infrastructure unavailable", error);
      this.showUnavailable("Public infrastructure unavailable");
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
    this.layers.prices = L.layerGroup().addTo(this.map);
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
    const current = this.marketAgeMinutes(snapshot) <= 45;
    this.setField("interval", `Updated ${pacificTime(snapshot.sourceUpdatedAt)}`);
    this.field("interval").title = snapshot.interval.label;
    this.setField("status", current ? "Current" : "Delayed");
    this.setField("insight-title", Math.abs(spread) < 2 ? "California is broadly aligned" : "Prices are separating across California");
    this.setField("insight-summary", snapshot.insight.summary);
    this.setField("insight-driver", snapshot.insight.driver);
    this.root.dataset.marketStatus = current ? "live" : "delayed";
  }

  marketAgeMinutes(snapshot) {
    return Math.max(0, (Date.now() - Date.parse(snapshot.sourceUpdatedAt)) / 60_000);
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
        : "nearly balanced");
  }

  selectHub(id, pan = false) {
    const hub = this.market?.hubs.find((item) => item.id === id);
    if (!hub) return;
    this.root.querySelectorAll("[data-grid-hub]").forEach((button) => {
      button.classList.toggle("is-selected", button.dataset.gridHub === id);
      button.setAttribute("aria-pressed", button.dataset.gridHub === id ? "true" : "false");
    });
    const detail = this.root.querySelector("[data-grid-detail]");
    if (detail) detail.hidden = false;
    this.root.querySelector('[data-grid-detail="name"]').textContent = `${hub.id} · ${hub.region}`;
    this.root.querySelector('[data-grid-detail="price"]').textContent = money(hub.lmp);
    ["energy", "congestion", "loss"].forEach((key) => {
      this.root.querySelector(`[data-grid-detail="${key}"]`).textContent = money(hub.components[key]);
    });
    if (pan) {
      this.map.flyTo(hub.coordinates, Math.max(this.map.getZoom(), 7), { duration: 0.65 });
      this.hubMarkers.get(id)?.openTooltip();
    }
  }

  showUnavailable(message) {
    this.root.dataset.marketStatus = "unavailable";
    this.setField("status", message);
  }
}

if (explorer) new CaliforniaGridExplorer(explorer);
