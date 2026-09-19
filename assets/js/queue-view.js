import { validateQueueIndex, validateQueueSnapshot, technology, queueDays, median, compareQueues, CHANGE_FIELDS, matchSubstation, countyLabel } from "./queue-data.js";

const root = document.querySelector("[data-queue-explorer]");
const number = new Intl.NumberFormat("en-US", {maximumFractionDigits: 1});
const label = value => value === null || value === undefined || value === "" ? "Not reported" : String(value);
const years = days => days === null ? "Unavailable" : `${number.format(days / 365.2425)} yr`;
const element = (tag, text, className) => {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
};

async function getJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

class QueueExplorer {
  constructor(container) {
    this.root = container;
    this.ui = Object.fromEntries([...container.querySelectorAll("[data-q]")].map(el => [el.dataset.q, el]));
    this.base = container.dataset.endpoint;
    this.features = [];
    this.matches = new Map();
    this.page = 0;
    this.generation = 0;
    this.mapUnavailable = false;
    this.ui.close.addEventListener("click", () => this.ui.dialog.close());
    container.querySelector("form").addEventListener("submit", event => event.preventDefault());
    for (const key of ["search", "technology", "county", "state", "status", "sort"]) {
      this.ui[key].addEventListener(key === "search" ? "input" : "change", () => { this.page = 0; this.render(); });
    }
    this.ui.reset.addEventListener("click", () => {
      for (const key of ["search", "technology", "county", "state"]) this.ui[key].value = "";
      this.ui.status.value = "ACTIVE";
      this.page = 0;
      this.render();
    });
    this.ui.previous.addEventListener("click", () => { this.page--; this.renderTable(); });
    this.ui.next.addEventListener("click", () => { this.page++; this.renderTable(); });
    this.ui.snapshot.addEventListener("change", () => this.loadSnapshot(Number(this.ui.snapshot.value)));
    this.ui["map-reset"].addEventListener("click", () => this.map?.fitBounds([[32.3, -124.5], [42.1, -114.1]]));
  }

  async start() {
    try {
      this.index = validateQueueIndex(await getJson(`${this.base}index.json`));
      this.index.snapshots.forEach((entry, index) => {
        this.ui.snapshot.add(new Option(new Date(entry.collectedAt).toLocaleString("en-US", {timeZone: "America/Los_Angeles", timeZoneName: "short"}), index));
      });
      await this.loadSnapshot(this.index.snapshots.length - 1);
      this.initMap();
    } catch (error) {
      this.ui.edition.textContent = "Queue reports are unavailable. Please use the CAISO source reports linked below or try again later.";
      const link = element("a", "Open CAISO queue reports ↗");
      link.href = "https://www.caiso.com/generation-transmission/generation/generator-interconnection";
      this.ui.edition.append(" ", link);
      console.error("Queue load failed", error);
    }
  }

  async loadSnapshot(index) {
    const generation = ++this.generation;
    this.ui.snapshot.disabled = true;
    this.ui.edition.textContent = "Loading saved observation…";
    try {
      const entry = this.index.snapshots[index];
      const current = validateQueueSnapshot(await getJson(this.base + entry.file));
      if (current.id !== entry.id) throw new Error("Snapshot identity mismatch");
      let previous = null;
      let comparisonUnavailable = false;
      if (index > 0) {
        try {
          previous = validateQueueSnapshot(await getJson(this.base + this.index.snapshots[index - 1].file));
          if (previous.id !== this.index.snapshots[index - 1].id) throw new Error("Previous identity mismatch");
        } catch { comparisonUnavailable = true; }
      }
      if (generation !== this.generation) return;
      this.snapshot = current;
      this.sources = current.sources;
      this.ui.snapshot.value = index;
      this.ui.content.hidden = false;
      const checked = new Date(this.index.checkedAt).toLocaleDateString("en-US", {timeZone: "America/Los_Angeles"});
      this.ui.edition.textContent = `Older queue: ${this.sources.find(s => s.id === "legacy").reportDate} · Cluster 15: ${this.sources.find(s => s.id === "cluster15").reportDate} · Last source check: ${checked} Pacific`;
      for (const [key, getValue] of [["technology", technology], ["county", p => countyLabel(p.county)], ["state", p => p.state]]) {
        const selected = this.ui[key].value;
        const first = this.ui[key].options[0];
        this.ui[key].replaceChildren(first);
        [...new Set(current.projects.map(getValue).filter(Boolean))].sort().forEach(value => this.ui[key].add(new Option(value, value)));
        this.ui[key].value = [...this.ui[key].options].some(o => o.value === selected) ? selected : "";
      }
      this.page = 0;
      this.matchLocations();
      this.render();
      this.renderChanges(previous, comparisonUnavailable);
      this.renderSources();
    } catch (error) {
      if (generation !== this.generation) return;
      if (this.snapshot) this.ui.snapshot.value = this.index.snapshots.findIndex(e => e.id === this.snapshot.id);
      this.ui.edition.textContent = "This saved observation could not be loaded. The previous selection remains displayed; choose another observation to retry.";
      this.ui.content.hidden = !this.snapshot;
      console.error(error);
    } finally {
      if (generation === this.generation) this.ui.snapshot.disabled = false;
    }
  }

  days(project) {
    return queueDays(project, this.sources.find(s => s.id === project.sourceId).reportDate);
  }

  matchLocations() {
    this.matches = new Map(this.snapshot.projects.map(p => [p.id, matchSubstation(p, this.features)]));
  }

  async initMap() {
    try {
      if (!window.L) throw new Error("Map library unavailable");
      const geo = await getJson(this.root.dataset.substations);
      if (geo.type !== "FeatureCollection" || !Array.isArray(geo.features)) throw new Error("Invalid substation data");
      this.features = geo.features;
      document.getElementById("queue-map").replaceChildren();
      this.map = L.map("queue-map", {scrollWheelZoom: false, zoomSnap: .25}).fitBounds([[32.3, -124.5], [42.1, -114.1]]);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · Substations: CEC', maxZoom: 18}).addTo(this.map);
      this.markers = L.layerGroup().addTo(this.map);
      this.matchLocations();
      this.renderMap();
      try {
        const area = await getJson(this.root.dataset.area);
        L.geoJSON(area, {style: {color: "#173f78", weight: 1.3, dashArray: "5 5", fillOpacity: .035}, interactive: false}).addTo(this.map);
      } catch { /* The optional historical outline does not affect project records. */ }
    } catch (error) {
      this.mapUnavailable = true;
      document.getElementById("queue-map").replaceChildren(element("p", "The reference map is unavailable. All connection points remain available in the project records."));
      this.renderMap();
      console.error("Queue map unavailable", error);
    }
  }

  render() {
    const search = this.ui.search.value.trim().toLowerCase();
    this.filtered = this.snapshot.projects.filter(p =>
      (!this.ui.status.value || p.status === this.ui.status.value)
      && (!this.ui.technology.value || technology(p) === this.ui.technology.value)
      && (!this.ui.county.value || countyLabel(p.county) === this.ui.county.value)
      && (!this.ui.state.value || p.state === this.ui.state.value)
      && (!search || [p.name, p.id, p.poi, p.county, p.utility, technology(p)].join(" ").toLowerCase().includes(search)));
    const projects = this.filtered;
    const capacities = projects.map(p => p.netMw).filter(Number.isFinite);
    const times = projects.map(p => this.days(p));
    const stats = [
      [number.format(projects.length), "Projects in this selection"],
      [capacities.length ? `${number.format(capacities.reduce((a, b) => a + b, 0) / 1000)} GW` : "Unavailable", `Net capacity${capacities.length < projects.length ? ` · ${projects.length - capacities.length} unreported` : ""}`],
      [years(median(times)), "Median recorded time in queue"],
      [number.format(new Set(projects.map(p => p.poi).filter(Boolean)).size), "Reported connection names"],
    ];
    this.ui.summary.replaceChildren(...stats.map(([value, caption]) => {
      const card = element("article"); card.append(element("strong", value), element("span", caption)); return card;
    }));
    const grouped = new Map();
    projects.forEach(p => { if (p.poi) { const key = `${p.utility}|${p.poi}`; if (!grouped.has(key)) grouped.set(key, []); grouped.get(key).push(p); } });
    this.ui.connections.replaceChildren(...[...grouped.values()].sort((a, b) => b.length - a.length).slice(0, 7).map(group => {
      const button = element("button", undefined, "queue-poi-button"); button.type = "button";
      const description = element("span", group[0].poi);
      description.append(element("small", `${group[0].utility} · ${group[0].county || "County not reported"}`));
      button.append(description, element("strong", `${group.length}`));
      button.addEventListener("click", () => this.selectPoi(group[0].poi)); return button;
    }));
    if (!projects.length) this.ui.connections.append(element("p", "No projects match these filters."));
    const techCounts = new Map();
    projects.forEach(p => techCounts.set(technology(p), (techCounts.get(technology(p)) || 0) + 1));
    this.renderBars(this.ui.technologies, [...techCounts].sort((a, b) => b[1] - a[1]));
    const bins = [["Under 2 years", 0], ["2–5 years", 0], ["5–10 years", 0], ["10+ years", 0]];
    times.filter(Number.isFinite).forEach(days => { const y = days / 365.2425; bins[y < 2 ? 0 : y < 5 ? 1 : y < 10 ? 2 : 3][1]++; });
    this.renderBars(this.ui.ages, bins);
    this.ui["age-note"].textContent = `${times.filter(t => t === null).length} projects have unavailable time in queue. Older entries can include amendments to existing plants.`;
    this.renderMap();
    this.renderTable();
  }

  renderBars(target, values) {
    const max = Math.max(1, ...values.map(v => v[1]));
    target.replaceChildren(...values.map(([name, count]) => {
      const row = element("div", undefined, "queue-bar");
      const caption = element("div", undefined, "queue-bar-label"); caption.append(element("span", name), element("span", `${count} projects`));
      const track = element("div", undefined, "queue-bar-track"); track.setAttribute("aria-hidden", "true");
      const fill = element("div", undefined, "queue-bar-fill"); fill.style.width = `${count / max * 100}%`; track.append(fill); row.append(caption, track); return row;
    }));
  }

  selectPoi(poi) {
    this.ui.search.value = poi;
    this.page = 0;
    this.render();
    document.getElementById("queue-project-title").scrollIntoView({behavior: "smooth", block: "start"});
  }

  renderMap() {
    const matched = this.filtered.filter(p => this.matches.get(p.id));
    this.ui["map-note"].textContent = this.mapUnavailable ? "Project records are available below; map unavailable." : `${matched.length} of ${this.filtered.length} selected projects matched to reference substations. Circles scale with project count. Unmatched projects are included in all totals and records. Dashed outline: CAISO area, 2021 reference.`;
    if (!this.markers) return;
    this.markers.clearLayers();
    const groups = new Map();
    matched.forEach(p => { const f = this.matches.get(p.id); const key = JSON.stringify(f.geometry.coordinates); if (!groups.has(key)) groups.set(key, {feature: f, projects: []}); groups.get(key).projects.push(p); });
    groups.forEach(({feature, projects}) => {
      const [lon, lat] = feature.geometry.coordinates;
      const tooltip = element("div", `${feature.properties.Name} · ${projects.length} projects`);
      const popup = element("div"); popup.append(element("strong", feature.properties.Name));
      const button = element("button", "Search this connection name");
      button.addEventListener("click", () => {
        this.ui.search.value = feature.properties.Name; this.page = 0; this.render();
        document.getElementById("queue-project-title").scrollIntoView({behavior: "smooth"});
      });
      popup.append(element("p", "Reference substation location"), button);
      L.circleMarker([lat, lon], {radius: 5 + Math.sqrt(projects.length) * 3, color: "#173f78", weight: 1.3, fillColor: "#bf7956", fillOpacity: .7}).bindTooltip(tooltip).bindPopup(popup).addTo(this.markers);
    });
  }

  renderTable() {
    const mode = this.ui.sort.value;
    const sorted = [...this.filtered].sort((a, b) => mode === "name" ? a.name.localeCompare(b.name) :
      (mode === "age" ? (this.days(b) ?? -1) - (this.days(a) ?? -1) : (b.netMw ?? -1) - (a.netMw ?? -1)) || a.id.localeCompare(b.id));
    const pages = Math.max(1, Math.ceil(sorted.length / 20));
    this.page = Math.max(0, Math.min(this.page, pages - 1));
    this.ui.rows.replaceChildren(...sorted.slice(this.page * 20, (this.page + 1) * 20).map(p => {
      const row = element("tr"); const first = element("td"); const button = element("button", p.name, "queue-project-link");
      button.addEventListener("click", () => this.showProject(p)); first.append(button, element("small", `Queue ${p.id} · ${p.studyProcess}`)); row.append(first);
      const poi = element("td", label(p.poi)); poi.append(element("small", `${p.county || "County not reported"}, ${p.state || "State not reported"}`));
      row.append(element("td", technology(p)), poi, element("td", p.netMw === null ? "Not reported" : number.format(p.netMw)), element("td", years(this.days(p))), element("td", p.status.toLowerCase())); return row;
    }));
    this.ui.results.textContent = `${sorted.length} matching projects. Select a project for dates, component capacities, and its source record.`;
    this.ui.page.textContent = `Page ${this.page + 1} of ${pages}`;
    this.ui.previous.disabled = this.page === 0;
    this.ui.next.disabled = this.page >= pages - 1;
  }

  showProject(p) {
    const source = this.sources.find(s => s.id === p.sourceId);
    const content = this.ui.detail;
    const heading = element("h2", p.name); heading.id = "queue-detail-title";
    content.replaceChildren(heading, element("p", `Queue ${p.id} · ${p.status.toLowerCase()} · ${p.studyProcess}`, "eyebrow"));
    content.append(element("p", technology(p), "queue-detail-technology"));
    const metrics = element("div", undefined, "queue-detail-metrics");
    const ageEnd = p.status === "ACTIVE" ? source.reportDate : p.status === "COMPLETED" ? p.completedDate : p.withdrawnDate;
    for (const [value, caption, note] of [
      [p.netMw === null ? "Not reported" : `${number.format(p.netMw)} MW`, "Net connection capacity", "Shared grid connection limit"],
      [years(this.days(p)), p.status === "ACTIVE" ? "Time since queue entry" : "Recorded time in queue", ageEnd ? `Through ${ageEnd}` : "Exit date not reported"],
    ]) {
      const metric = element("div");
      metric.append(element("strong", value), element("span", caption), element("small", note));
      metrics.append(metric);
    }
    content.append(metrics);
    const definitionList = entries => {
      const list = element("dl");
      entries.forEach(([name, value]) => list.append(element("dt", name), element("dd", label(value))));
      return list;
    };
    const online = p.status === "COMPLETED" ? ["Actual online", p.completedDate] : p.status === "WITHDRAWN" ? ["Withdrawn", p.withdrawnDate] : ["Requested online", p.currentOnlineDate];
    content.append(definitionList([
      ["Connection point", p.poi], ["Location", [p.county, p.state].filter(Boolean).join(", ")], online,
    ]));
    content.append(element("p", "Queue age is not an estimate of remaining wait. Requested online dates can change.", "queue-note"));
    for (const [title, entries] of [
      ["Dates and application status", [
        ["Queue entry", p.queueDate], ["Application received", p.applicationDate],
        ["Original / requested online", p.originalOnlineDate], ["Current / requested online", p.currentOnlineDate],
        ["Actual online", p.completedDate], ["Withdrawal", p.withdrawnDate], ["Agreement", p.agreementStatus],
      ]],
      ["Technical details and source", [
        ["Transmission owner", p.utility], ["Study area", p.studyRegion], ["Deliverability", p.deliverability],
        ["Technology components", p.components.map(c => `${c.fuel}: ${c.capacityMw === null ? "MW not reported" : `${number.format(c.capacityMw)} MW`}`).join("; ")],
        ["Map location", this.matches.get(p.id) ? "Matched reference substation; not the project footprint" : "No unambiguous reference substation match"],
        ["Source edition", `${source.reportDate} (${source.dateKind})`], ["Source record", `${p.sourceSheet}, row ${p.sourceRow}`],
      ]],
    ]) {
      const disclosure = element("details", undefined, "queue-detail-more");
      disclosure.append(element("summary", title), definitionList(entries));
      content.append(disclosure);
    }
    const link = element("a", "Download this source workbook ↗"); link.href = this.base + source.file; content.append(link);
    this.ui.dialog.scrollTop = 0;
    this.ui.dialog.showModal();
  }

  renderChanges(previous, unavailable) {
    this.ui.changes.replaceChildren();
    if (unavailable) { this.ui["change-note"].textContent = "The preceding observation could not be loaded. Change comparison is unavailable."; return; }
    const changes = compareQueues(previous, this.snapshot);
    if (changes === null) {
      this.ui["change-note"].textContent = "Our first observation establishes the baseline. As new reports arrive, this section will show status changes, revised online dates, changes in capacity or technology, and records that appear or disappear.";
      return;
    }
    this.ui["change-note"].textContent = `${changes.length} project records changed since the observation on ${previous.collectedAt.slice(0, 10)}. These are observed changes between reports; their effective dates may be earlier.`;
    changes.forEach(change => {
      const article = element("article"); article.append(element("strong", `${change.name} · Queue ${change.id}`));
      if (change.kind !== "updated") article.append(element("p", change.kind === "appeared" ? "Newly present in these reports" : "Absent from these reports; outcome unconfirmed"));
      else {
        const list = element("ul");
        change.fields.forEach(field => {
          const format = v => Array.isArray(v) ? v.map(c => `${c.fuel} ${label(c.capacityMw)} MW`).join("; ") : label(v);
          list.append(element("li", `${CHANGE_FIELDS[field.key]}: ${format(field.before)} → ${format(field.after)}`));
        }); article.append(list);
      }
      this.ui.changes.append(article);
    });
  }

  renderSources() {
    this.ui.sources.replaceChildren(...this.sources.map(source => {
      const p = element("p", `${source.id === "legacy" ? "Cluster 14 and earlier" : "Cluster 15"}: ${source.reportDate} (${source.dateKind}). `);
      const link = element("a", "Saved workbook"); link.href = this.base + source.file;
      const original = element("a", "Current CAISO download ↗"); original.href = source.url;
      p.append(link, " · ", original); return p;
    }));
  }
}

if (root) new QueueExplorer(root).start();
