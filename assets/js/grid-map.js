import { validateElectricitySnapshot } from "./electricity-desk-schema.js";
import { freshnessFor } from "./data-freshness.js";
import { validateGridMarketSnapshot } from "./grid-market-schema.js";
import { GridTimeline } from "./grid-timeline.js";

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
    this.latestMarket = null;
    this.latestDesk = null;
    this.frame = null;
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
    this.timeline = new GridTimeline(this.root, (row, mode) => this.renderFrame(row, mode));
    if (typeof window.L === "undefined") {
      this.showUnavailable("Map library unavailable");
    } else {
      this.createMap();
      this.bindControls();
      this.loadAreaBoundary();
    }

    const infrastructure = this.map ? Promise.all([
      fetchJson(this.root.dataset.linesEndpoint, 25_000),
      fetchJson(this.root.dataset.substationsEndpoint, 25_000),
    ]).then(([lines, substations]) => this.renderInfrastructure(lines, substations)) : Promise.resolve();

    const market = this.refreshData();
    window.setInterval(() => this.refreshData(), 5 * 60_000);
    window.setInterval(() => this.timeline.ageIntervals(), 60_000);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") { this.timeline.ageIntervals(); this.refreshData(); }
    });

    try {
      await Promise.all([infrastructure, market]);
      this.root.dataset.status = "ready";
      if (this.map) this.root.querySelector(".grid-loading")?.remove();
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
          if (this.latestMarket && Date.parse(snapshot.sourceUpdatedAt) < Date.parse(this.latestMarket.sourceUpdatedAt)) throw new Error("Market snapshot moved backwards");
          this.marketRefreshFailed = false;
          this.latestMarket = snapshot;
        }).catch((error) => { this.marketRefreshFailed = true; console.error("Market refresh failed", error); }),
        fetchJson(this.root.dataset.deskEndpoint).then((data) => {
          const snapshot = validateElectricitySnapshot(data);
          if (this.latestDesk && Date.parse(snapshot.sourceUpdatedAt) < Date.parse(this.latestDesk.sourceUpdatedAt)) throw new Error("Electricity snapshot moved backwards");
          this.latestDesk = snapshot;
          this.deskRefreshFailed = false;
        }).catch((error) => { this.deskRefreshFailed = true; console.error("Electricity refresh failed", error); }),
      ]);
      await this.timeline.ready;
      await this.timeline.updateLatest({ electricity: this.latestDesk, market: this.latestMarket });
      if (this.hasRefreshed && this.timeline.mode === "latest") await this.timeline.refreshIndex();
      this.hasRefreshed = true;
    } finally { this.refreshing = false; this.updateFreshness(); }
  }

  updateFreshness() {
    if (!this.frame?.row) return;
    if (this.frame.mode !== "latest") {
      this.root.dataset.marketStatus = "history";
      this.setField("status", this.frame.mode === "preview" ? "Interval preview" : "Selected interval");
      this.setField("interval", pacificTime(this.frame.row.timestamp));
      return;
    }
    const marketStatus = freshnessFor(this.market, Date.now(), this.marketRefreshFailed);
    this.root.dataset.marketStatus = marketStatus.key;
    this.setField("status", marketStatus.label);
    this.setField("interval", pacificTime(this.frame.row.timestamp));
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

  renderFrame(row, mode) {
    this.frame = { row, mode };
    this.market = row?.market ?? null;
    this.desk = row?.electricity ?? null;
    if (this.market) this.renderMarket(this.market);
    else {
      if (this.layers.prices && this.map) this.map.removeLayer(this.layers.prices);
      delete this.layers.prices;
      this.hubMarkers.clear();
      this.root.querySelectorAll("[data-hub-price]").forEach((element) => { element.textContent = "n/a"; });
      this.root.querySelector("[data-grid-detail]").hidden = true;
      this.setField("spread", "n/a");
      this.setField("spread-direction", "No matching price interval");
      this.setField("insight-title", mode === "loading" ? "Loading this day" : "Prices unavailable for this interval");
      this.setField("insight-summary", row?.marketPending ? "This price interval is not yet due." : "No verified market record is available at the selected time.");
      this.setField("insight-driver", "");
    }
    this.root.querySelectorAll("[data-grid-hub]").forEach((button) => { button.disabled = !this.market; });
    this.renderDesk(this.desk);
    if (!this.desk) {
      this.setField("demand-detail", row?.electricityPending ? "Interval not yet due" : "No measurement at this interval");
      this.setField("battery-detail", row?.electricityPending ? "Interval not yet due" : "No measurement at this interval");
    }
    if (!row) {
      this.root.dataset.marketStatus = "unavailable";
      this.setField("status", mode === "loading" ? "Loading history" : "History unavailable");
      this.setField("interval", "");
    } else this.updateFreshness();
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
    // Keep the reference area below transmission lines and hub markers.
    this.map.createPane("caiso-area");
    this.map.getPane("caiso-area").style.zIndex = 350;
    this.map.getPane("caiso-area").style.pointerEvents = "none";
  }

  async loadAreaBoundary() {
    const control = this.root.querySelector('[data-grid-layer="caiso-area"]');
    try {
      const area = await fetchJson(this.root.dataset.areaEndpoint);
      if (area?.type !== "FeatureCollection" || !Array.isArray(area.features) || !area.features.length
        || area.features.some((feature) => feature.properties?.NAME !== "CALISO"
          || !["Polygon", "MultiPolygon"].includes(feature.geometry?.type))) {
        throw new TypeError("CAISO reference area is not valid polygon GeoJSON");
      }
      this.layers["caiso-area"] = L.geoJSON(area, {
        pane: "caiso-area",
        interactive: false,
        style: { color: "#665b78", weight: 2, opacity: 0.85, dashArray: "6 5", fillColor: "#80718f", fillOpacity: 0.07 },
        attribution: '<a href="https://www.arcgis.com/home/item.html?id=147c83114a3f4ff8a82225e3d6c24857">CEC / CAISO / BANC · 2021</a>',
      });
      if (control.checked) this.layers["caiso-area"].addTo(this.map);
      control.disabled = false;
      this.setField("area-status", "Dashed boundary: approximate CAISO balancing area, from CEC’s retired 2021 geometry. It is a historical reference, not a current operational boundary or a price zone.");
      const source = document.createElement("a");
      source.href = "https://www.arcgis.com/home/item.html?id=147c83114a3f4ff8a82225e3d6c24857";
      source.textContent = " Boundary source ↗";
      this.field("area-status").append(source);
    } catch (error) {
      console.error("CAISO reference boundary unavailable", error);
      control.checked = false;
      control.disabled = true;
      this.setField("area-status", "CAISO reference boundary unavailable. Other map layers remain available.");
    }
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
    if (this.map && !this.layers.prices) {
      this.layers.prices = L.layerGroup();
      if (this.root.querySelector('[data-grid-layer="prices"]').checked) this.layers.prices.addTo(this.map);
    }
    snapshot.hubs.forEach((hub) => {
      if (this.map) {
        const label = `<strong>${escapeHtml(hub.id)}</strong> ${escapeHtml(money(hub.lmp))}`;
        let marker = this.hubMarkers.get(hub.id);
        if (marker) {
          marker.setLatLng(hub.coordinates);
          marker.setStyle({ fillColor: priceColor(hub.lmp) });
          marker.setTooltipContent(label);
        } else {
          marker = L.circleMarker(hub.coordinates, {
            radius: 14, color: "#f3eee5", weight: 3, fillColor: priceColor(hub.lmp), fillOpacity: 0.96,
            className: "grid-price-marker",
          });
          marker.bindTooltip(label, { permanent: true, direction: "right", offset: [13, 0], className: "grid-price-label" });
          marker.on("click", () => this.selectHub(hub.id));
          marker.addTo(this.layers.prices);
          this.hubMarkers.set(hub.id, marker);
        }
      }
      this.root.querySelector(`[data-hub-price="${hub.id}"]`).textContent = money(hub.lmp);
    });

    const spread = snapshot.insight.northSouthSpread;
    this.setField("spread", `${spread < 0 ? "−" : ""}$${Math.abs(spread).toFixed(2)}/MWh`);
    this.setField("spread-direction", spread === 0 ? "SP15 level with NP15" : `SP15 ${spread > 0 ? "above" : "below"} NP15`);
    this.field("interval").title = snapshot.interval.label;
    this.setField("insight-title", Math.abs(spread) < 2 ? "California is broadly aligned" : "Prices are separating across California");
    this.setField("insight-summary", snapshot.insight.summary);
    this.setField("insight-driver", snapshot.insight.driver);
    if (this.selectedHub) this.selectHub(this.selectedHub);
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
    if (pan && this.map) {
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
