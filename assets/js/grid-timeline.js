import { availableDates, buildTimeline, chartSegments, findDayEvents, HISTORY_DATASETS, mergeLatest, netDemandMw, sliderTimeMarkers, validateHistoryDay, validateHistoryIndex } from "./grid-history.js";
import { pacificDate, FIVE_MINUTES_MS } from "./grid-time.js";

const clock = new Intl.DateTimeFormat("en-US", { timeZone: "America/Los_Angeles", hour: "numeric", minute: "2-digit", timeZoneName: "short" });
const number = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const price = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
const formatValue = (value, units) => Number.isFinite(value) ? `${units === "$/MWh" ? price.format(value) : number.format(value)} ${units === "$/MWh" ? "/MWh" : units}` : "unavailable";
const CHARTS = [
  { id: "demand", title: "Demand", units: "MW", series: [
    { label: "Demand", color: "#173f78", value: (row) => row.electricity?.demand.currentMw },
    { label: "Demand − solar − wind", color: "#76617e", dash: "5 4", value: netDemandMw },
  ] },
  { id: "renewables", title: "Solar + wind", units: "MW", series: [
    { label: "Solar", color: "#9a6d13", value: (row) => row.electricity?.supply.solarMw },
    { label: "Wind", color: "#3d7658", dash: "5 4", value: (row) => row.electricity?.supply.windMw },
  ] },
  { id: "battery", title: "Battery power", units: "MW", series: [
    { label: "+ supply / − charging", color: "#3d7658", value: (row) => row.electricity?.supply.batteryMw },
  ] },
  { id: "prices", title: "Regional hub prices", units: "$/MWh", series: [
    ...[ ["NP15", "#173f78", ""], ["ZP26", "#9a6d13", "5 4"], ["SP15", "#a64e3d", "2 3"] ].map(([label, color, dash]) => ({
      label, color, dash, value: (row) => row.market?.hubs.find((hub) => hub.id === label)?.lmp,
    })),
  ] },
];
const X0 = 58;
const Y0 = 16;
const Y1 = 140;

function svgElement(name, attributes = {}, text = "") {
  const node = document.createElementNS("http://www.w3.org/2000/svg", name);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
  if (text) node.textContent = text;
  return node;
}

async function fetchJson(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);
  try {
    const response = await fetch(url, { cache: "no-store", signal: controller.signal });
    if (!response.ok) throw new Error(`History request returned ${response.status}`);
    return await response.json();
  } finally { clearTimeout(timeout); }
}

export class GridTimeline {
  constructor(root, onSelect) {
    this.root = root;
    this.onSelect = onSelect;
    this.base = new URL(root.dataset.historyEndpoint, document.baseURI);
    this.mode = "latest";
    this.rows = [];
    this.records = { electricity: [], market: [] };
    this.latest = {};
    this.dates = [];
    this.requestId = 0;
    this.selected = 0;
    this.preview = null;
    this.charts = [];
    this.bindControls();
    this.chartResize = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width === this.chartWidth) return;
      this.chartWidth = entry.contentRect.width;
      requestAnimationFrame(() => {
        if (this.rows.length && !this.loading) { this.renderCharts(); this.emitSelection(); }
      });
    });
    this.chartResize.observe(this.element("charts"));
    this.ready = this.refreshIndex();
  }

  element(name) { return this.root.querySelector(`[data-timeline="${name}"]`); }

  bindControls() {
    this.element("date").addEventListener("change", (event) => {
      this.mode = "history";
      this.loadDate(event.target.value);
    });
    for (const [action, direction] of [["previous", -1], ["next", 1]]) {
      this.element(action).addEventListener("click", () => {
        const date = this.dates[this.dates.indexOf(this.date) + direction];
        if (date) { this.mode = "history"; this.loadDate(date); }
      });
    }
    this.element("latest").addEventListener("click", async () => {
      this.mode = "latest";
      await this.refreshIndex();
    });
    for (const name of ["range", "chart-range"]) this.element(name).addEventListener("input", (event) => this.select(Number(event.target.value)));
    this.root.querySelectorAll("[data-event-preset]").forEach((button) => {
      button.addEventListener("click", () => {
        const match = this.events?.[button.dataset.eventPreset];
        if (match) this.select(match.index);
      });
    });
  }

  async refreshIndex() {
    const requestId = ++this.requestId;
    try {
      const index = validateHistoryIndex(await fetchJson(new URL("index.json", this.base)));
      if (requestId !== this.requestId) return;
      this.index = index;
      this.dates = availableDates(index);
      this.indexFailed = false;
    } catch (error) {
      if (requestId !== this.requestId) return;
      console.error("History index unavailable", error);
      this.indexFailed = true;
    }
    this.includeLatestDate();
    if (this.mode === "latest" || !this.date) await this.loadDate(this.dates.at(-1));
  }

  includeLatestDate() {
    const timestamps = Object.values(this.latest).filter(Boolean).map((record) => record.intervalTimeUtc);
    if (timestamps.length) {
      const date = pacificDate(new Date(timestamps.sort().at(-1)));
      this.dates = [...new Set([...this.dates, date])].sort();
    }
    const dateInput = this.element("date");
    dateInput.disabled = !this.dates.length;
    dateInput.min = this.dates[0] ?? "";
    dateInput.max = this.dates.at(-1) ?? "";
    this.element("available").textContent = this.dates.length
      ? `Archive: ${this.dates.join(", ")} · Pacific time`
      : "Archive unavailable. Latest snapshots can still load.";
    // A compact range avoids a growing list after months of daily collection.
    if (this.dates.length > 4) this.element("available").textContent = `Archive: ${this.dates.length} dates, ${this.dates[0]} to ${this.dates.at(-1)} · Pacific time`;
  }

  async updateLatest(latest) {
    // Legacy snapshots lack a trustworthy interval key and cannot enter a linked timeline.
    this.latest = Object.fromEntries(Object.entries(latest).filter(([, record]) => record?.schemaVersion === 2));
    this.includeLatestDate();
    if (this.mode !== "latest") return;
    if (this.date !== this.dates.at(-1) || !this.date) await this.loadDate(this.dates.at(-1));
    else if (!this.loading) this.rebuild();
  }

  async loadDate(date) {
    const requestId = ++this.requestId;
    this.date = date;
    this.preview = null;
    this.rows = [];
    this.records = { electricity: [], market: [] };
    this.errors = [];
    this.renderTimeMarkers();
    this.loading = true;
    this.element("range").disabled = true;
    this.element("chart-range").disabled = true;
    this.element("chart-selection").textContent = "Loading intervals…";
    this.element("charts").replaceChildren();
    this.charts = [];
    this.element("date").value = date ?? "";
    this.element("selection").textContent = date ? `Loading ${date}…` : "No archive is available";
    this.element("coverage").textContent = "";
    this.setPresets();
    this.updateNavigation();
    this.onSelect(null, "loading");
    if (!date || !this.dates.includes(date)) {
      this.loading = false;
      this.element("selection").textContent = "No archive for this date. Choose an available date.";
      this.element("chart-selection").textContent = "No archive for this date";
      this.setPresets();
      this.onSelect(null, "unavailable");
      return;
    }
    await Promise.all(HISTORY_DATASETS.map(async (dataset) => {
      if (!this.index?.datasets[dataset].some((entry) => entry.date === date)) return;
      try {
        const data = await fetchJson(new URL(`${dataset}/${date}.json`, this.base));
        const records = validateHistoryDay(data, dataset, date);
        if (requestId === this.requestId) this.records[dataset] = records;
      } catch (error) {
        if (requestId === this.requestId) this.errors.push(dataset);
        console.error(`${dataset} history unavailable`, error);
      }
    }));
    if (requestId !== this.requestId) return;
    this.loading = false;
    this.rebuild();
  }

  updateNavigation() {
    const index = this.dates.indexOf(this.date);
    this.element("previous").disabled = index <= 0;
    this.element("next").disabled = index < 0 || index >= this.dates.length - 1;
    this.element("latest").setAttribute("aria-pressed", String(this.mode === "latest"));
  }

  rebuild() {
    const records = HISTORY_DATASETS.map((dataset) => mergeLatest(this.records[dataset], this.latest[dataset], this.date));
    this.rows = buildTimeline(this.date, ...records);
    const lastPresent = this.rows.findLastIndex((row) => row.electricity || row.market);
    if (this.mode === "latest") this.selected = Math.max(0, lastPresent);
    else this.selected = Math.max(0, this.rows.findIndex((row) => row.electricity || row.market));
    this.element("range").max = this.rows.length - 1;
    this.element("range").disabled = !this.rows.length;
    this.element("chart-range").max = this.rows.length - 1;
    this.element("chart-range").disabled = !this.rows.length;
    this.renderTimeMarkers();
    this.renderCoverage();
    this.renderCharts();
    this.setPresets();
    this.emitSelection();
  }

  ageIntervals(nowMs = Date.now()) {
    if (!this.rows.length || this.loading) return;
    for (const row of this.rows) {
      row.electricityPending = row.timeMs > nowMs;
      row.marketPending = row.timeMs + FIVE_MINUTES_MS > nowMs;
    }
    this.renderTimeMarkers(nowMs);
    this.renderCoverage();
    this.emitSelection();
  }

  renderTimeMarkers(nowMs = Date.now()) {
    const { ticks, nowPercent } = sliderTimeMarkers(this.rows, nowMs);
    for (const name of ["scale", "chart-scale"]) {
      const scale = this.element(name);
      scale.replaceChildren();
      scale.classList.toggle("has-now", nowPercent !== null);
      for (const tick of ticks) {
        const label = document.createElement("span");
        label.className = "grid-time-tick";
        label.textContent = tick.label;
        label.style.left = `${tick.percent}%`;
        if (tick.percent === 0) label.classList.add("is-first");
        if (tick.percent === 100) label.classList.add("is-last");
        scale.append(label);
      }
      if (nowPercent !== null) {
        const marker = document.createElement("span");
        marker.className = "grid-time-now";
        marker.textContent = "Now";
        marker.title = `Current time: ${clock.format(new Date(nowMs))}`;
        marker.style.left = `${nowPercent}%`;
        if (nowPercent < 5) marker.classList.add("is-first");
        if (nowPercent > 95) marker.classList.add("is-last");
        scale.append(marker);
      }
    }
  }

  renderCoverage() {
    const counts = HISTORY_DATASETS.map((dataset) => {
      const present = this.rows.filter((row) => row[dataset]).length;
      const gaps = this.rows.filter((row) => !row[dataset] && !row[`${dataset}Pending`]).length;
      const future = this.rows.filter((row) => !row[dataset] && row[`${dataset}Pending`]).length;
      return `${dataset === "market" ? "Prices" : "Electricity"}: ${present}/${this.rows.length} intervals · ${gaps} missing · ${future} not yet due`;
    });
    this.element("coverage").textContent = [...counts, ...(this.indexFailed ? ["Archive index could not refresh."] : []),
      ...(this.errors.length ? [`Could not load ${this.errors.join(" and ")} archive; showing only available snapshots.`] : [])].join(". ");
  }

  select(index) {
    if (!this.rows[index]) return;
    this.mode = "history";
    this.selected = index;
    this.preview = null;
    this.emitSelection();
  }

  emitSelection() {
    const index = this.preview ?? this.selected;
    const row = this.rows[index];
    if (!row) return;
    const mode = this.preview !== null ? "preview" : this.mode;
    const label = `${mode === "latest" ? "Latest available" : mode === "preview" ? "Preview" : "Selected"} · ${this.date} · ${clock.format(new Date(row.timestamp))}${row.timeMs > Date.now() ? " · Future interval — no data yet" : ""}`;
    this.element("selection").textContent = label;
    this.element("chart-selection").textContent = label;
    for (const name of ["range", "chart-range"]) {
      this.element(name).value = index;
      this.element(name).setAttribute("aria-valuetext", label);
    }
    this.updateNavigation();
    for (const chart of this.charts) {
      const x = chart.xFor(index);
      chart.cursor.setAttribute("x1", x);
      chart.cursor.setAttribute("x2", x);
      chart.spec.series.forEach((series, seriesIndex) => {
        const value = series.value(row);
        chart.readouts[seriesIndex].textContent = `${series.label}: ${formatValue(value, chart.spec.units)}`;
        const dot = chart.dots[seriesIndex];
        dot.setAttribute("visibility", Number.isFinite(value) ? "visible" : "hidden");
        if (Number.isFinite(value)) { dot.setAttribute("cx", x); dot.setAttribute("cy", chart.yFor(value)); }
      });
      chart.time.textContent = clock.format(new Date(row.timestamp));
    }
    this.onSelect(row, mode);
  }

  setPresets() {
    this.events = findDayEvents(this.rows);
    const descriptions = {
      negative: (event) => `${event.hub} ${price.format(event.value)}/MWh`,
      spread: (event) => `${price.format(Math.abs(event.value))}/MWh gap`,
      ramp: (event) => `+${number.format(event.value)} MW in one hour`,
    };
    const unavailable = { negative: "No negative prices observed", spread: "No nonzero spread observed", ramp: "No complete evening rise observed" };
    this.root.querySelectorAll("[data-event-preset]").forEach((button) => {
      const key = button.dataset.eventPreset;
      const event = this.events[key];
      button.disabled = !event;
      button.querySelector("small").textContent = event
        ? `${descriptions[key](event)} · ${clock.format(new Date(this.rows[event.index].timestamp))}`
        : this.loading ? "Loading…" : unavailable[key];
    });
  }

  renderCharts() {
    const host = this.element("charts");
    host.replaceChildren();
    this.charts = CHARTS.map((spec) => {
      const card = document.createElement("article");
      card.className = "grid-history-chart";
      const heading = document.createElement("h3");
      heading.textContent = `${spec.title} · ${spec.units}`;
      card.append(heading);
      const time = document.createElement("p");
      time.className = "grid-chart-time";
      card.append(time);
      host.append(card);
      const width = Math.max(280, card.getBoundingClientRect().width);
      const xEnd = width - 12;
      const svg = svgElement("svg", { viewBox: `0 0 ${width} 174`, preserveAspectRatio: "none", role: "img", "aria-label": `${spec.title} on ${this.date}. Use the shared interval slider to read exact values.` });
      const values = this.rows.flatMap((row) => spec.series.map((series) => series.value(row))).filter(Number.isFinite);
      const min = Math.min(0, ...values);
      const max = Math.max(0, ...values);
      const span = max - min || 1;
      const bottom = min - span * 0.06;
      const top = max + span * 0.06;
      const yFor = (value) => Y1 - (value - bottom) / (top - bottom) * (Y1 - Y0);
      const xFor = (index) => X0 + index / (this.rows.length - 1) * (xEnd - X0);
      for (const value of [...new Set([min, 0, max])]) {
        const y = yFor(value);
        svg.append(svgElement("line", { x1: X0, x2: xEnd, y1: y, y2: y, class: value === 0 ? "chart-zero" : "chart-rule" }));
        // Small signed solar readings can put the minimum almost on the zero tick.
        if (value !== 0 || (min < -span * 0.15 && max > span * 0.15) || min === 0 || max === 0) {
          svg.append(svgElement("text", { x: X0 - 8, y: y + 4, "text-anchor": "end" }, number.format(value)));
        }
      }
      for (const label of ["00:00", "06:00", "12:00", "18:00", "23:55"]) {
        const index = this.rows.findIndex((row) => row.label === label);
        if (index >= 0) svg.append(svgElement("text", { x: xFor(index), y: 165, "text-anchor": label === "23:55" ? "end" : "middle" }, label));
      }
      spec.series.forEach((series) => {
        for (const segment of chartSegments(this.rows, series.value, xFor, yFor)) {
          if (segment.length === 1) svg.append(svgElement("circle", { cx: segment[0][0], cy: segment[0][1], r: 2, fill: series.color }));
          else svg.append(svgElement("path", { d: segment.map(([x, y], index) => `${index ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`).join(" "), fill: "none", stroke: series.color, "stroke-width": 2, "stroke-dasharray": series.dash ?? "", "vector-effect": "non-scaling-stroke" }));
        }
      });
      if (!values.length) svg.append(svgElement("text", { x: (X0 + xEnd) / 2, y: 75, "text-anchor": "middle" }, "No measurements available"));
      const cursor = svgElement("line", { y1: Y0, y2: Y1, class: "chart-cursor" });
      svg.append(cursor);
      const dots = spec.series.map((series) => {
        const dot = svgElement("circle", { r: 3.5, fill: series.color, stroke: "#f5f3eb", "stroke-width": 1.5 });
        svg.append(dot);
        return dot;
      });
      const indexAt = (event) => {
        const box = svg.getBoundingClientRect();
        return Math.max(0, Math.min(this.rows.length - 1, Math.round(((event.clientX - box.left) / box.width * width - X0) / (xEnd - X0) * (this.rows.length - 1))));
      };
      svg.addEventListener("pointermove", (event) => {
        if (event.pointerType !== "mouse") return;
        const index = indexAt(event);
        if (this.preview === index) return;
        this.preview = index;
        this.emitSelection();
      });
      svg.addEventListener("pointerleave", () => { if (this.preview !== null) { this.preview = null; this.emitSelection(); } });
      svg.addEventListener("click", (event) => this.select(indexAt(event)));
      card.append(svg);
      const legend = document.createElement("div");
      legend.className = "grid-chart-values";
      const readouts = spec.series.map((series) => {
        const label = document.createElement("span");
        label.style.setProperty("--series-color", series.color);
        legend.append(label);
        return label;
      });
      card.append(legend);
      return { spec, cursor, dots, readouts, yFor, xFor, time };
    });
  }
}
