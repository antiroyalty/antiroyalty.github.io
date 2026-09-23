import { validateQueueIndex, validateQueueSnapshot, technology, queueDays, median, matchSubstation, countyLabel, queueAgeHistogram, isInQueueAgeBin, DAYS_PER_YEAR } from "./queue-data.js";

const root = document.querySelector("[data-queue-explorer]");
const number = new Intl.NumberFormat("en-US", {maximumFractionDigits: 1});
const label = value => value === null || value === undefined || value === "" ? "Not reported" : String(value);
const years = days => days === null ? "Unavailable" : `${number.format(days / DAYS_PER_YEAR)} yr`;
const element = (tag, text, className) => {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
};

function componentCapacities(components) {
  const list = element("div", undefined, "queue-components");
  if (!components.length) {
    list.append(element("span", "Component capacities not reported", "queue-components-missing"));
  }
  components.forEach(component => {
    const row = element("div", undefined, "queue-component");
    row.append(
      element("span", component.fuel || "Technology not reported"),
      element("strong", component.capacityMw === null ? "MW not reported" : `${number.format(component.capacityMw)} MW`),
    );
    list.append(row);
  });
  return list;
}

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
    this.generation = 0;
    this.mapUnavailable = false;
    this.ageSelection = null;
    this.markerRecords = [];
    this.ui["clear-highlight"].addEventListener("click", () => this.closeAgeBucket());
    container.addEventListener("keydown", event => {
      if (event.key === "Escape" && this.ageSelection && !this.ui.dialog.open) {
        event.preventDefault();
        event.stopPropagation();
        const trigger = this.ageSelection.trigger;
        // Focus before closing so its focus handler cannot reopen the list.
        trigger.focus();
        this.closeAgeBucket();
      }
    });
    document.addEventListener("pointerdown", event => {
      if (!this.ui.ages.contains(event.target) && !event.target.closest(".queue-geography, .queue-dialog")) this.closeAgeBucket();
    });
    this.ui.close.addEventListener("click", () => this.ui.dialog.close());
    const isBackdrop = event => {
      if (event.target !== this.ui.dialog) return false;
      const bounds = this.ui.dialog.getBoundingClientRect();
      return event.clientX < bounds.left || event.clientX > bounds.right
        || event.clientY < bounds.top || event.clientY > bounds.bottom;
    };
    let pressedBackdrop = false;
    this.ui.dialog.addEventListener("pointerdown", event => { pressedBackdrop = isBackdrop(event); });
    this.ui.dialog.addEventListener("click", event => {
      // Keep padding clicks and drags that start inside the dialog from dismissing it.
      if (pressedBackdrop && isBackdrop(event)) this.ui.dialog.close();
      pressedBackdrop = false;
    });
    container.querySelector("form").addEventListener("submit", event => event.preventDefault());
    for (const key of ["search", "technology", "county", "state", "status"]) {
      this.ui[key].addEventListener(key === "search" ? "input" : "change", () => this.render());
    }
    this.ui.reset.addEventListener("click", () => {
      for (const key of ["search", "technology", "county", "state"]) this.ui[key].value = "";
      this.ui.status.value = "ACTIVE";
      this.render();
    });
    this.ui["map-reset"].addEventListener("click", () => this.map?.fitBounds([[32.3, -124.5], [42.1, -114.1]]));
  }

  async start() {
    try {
      this.index = validateQueueIndex(await getJson(`${this.base}index.json`));
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
    this.ui.edition.textContent = "Loading saved observation…";
    try {
      const entry = this.index.snapshots[index];
      const current = validateQueueSnapshot(await getJson(this.base + entry.file));
      if (current.id !== entry.id) throw new Error("Snapshot identity mismatch");
      if (generation !== this.generation) return;
      this.snapshot = current;
      this.sources = current.sources;
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
      this.matchLocations();
      this.render();
      this.renderSources();
    } catch (error) {
      if (generation !== this.generation) return;
      this.ui.edition.textContent = "The latest queue observation could not be loaded. Reload the page to try again or use the source reports below.";
      this.ui.content.hidden = !this.snapshot;
      console.error(error);
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
      document.getElementById("queue-map").replaceChildren(element("p", "The reference map is unavailable. Use the filters and age intervals to explore projects."));
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
    this.renderAgeHistogram(times);
    this.ui["age-note"].textContent = `${times.filter(t => t === null).length} projects have unavailable time in queue. Older entries can include amendments to existing plants.`;
    this.renderMap();
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

  renderAgeHistogram(times) {
    this.closeAgeBucket();
    const bins = queueAgeHistogram(times);
    this.ui.ages.replaceChildren();
    if (!bins.length) {
      this.ui.ages.append(element("p", times.length ? "No reported queue ages for this selection." : "No projects match these filters.", "queue-note"));
      return;
    }
    const maxCount = Math.max(...bins.map(bin => bin.count));
    const chart = element("div", undefined, "queue-histogram-plot");
    chart.setAttribute("role", "list");
    chart.setAttribute("aria-label", "Project counts by time in queue, in two-year intervals");
    const panel = element("section", undefined, "queue-bucket-panel");
    panel.id = "queue-age-projects";
    panel.hidden = true;
    panel.setAttribute("aria-labelledby", "queue-age-projects-title");
    this.agePanel = panel;
    this.ui["bucket-detail"].replaceChildren(panel);
    for (const bin of bins) {
      const description = `${bin.fromYears} to under ${bin.toYears} years: ${bin.count} ${bin.count === 1 ? "project" : "projects"}`;
      const item = element("div");
      item.setAttribute("role", "listitem");
      const row = element("button", undefined, "queue-histogram-row");
      row.type = "button";
      row.setAttribute("aria-label", `${description}. Show projects`);
      row.setAttribute("aria-expanded", "false");
      row.setAttribute("aria-controls", panel.id);
      row.addEventListener("pointerenter", event => {
        if (event.pointerType !== "touch" && window.matchMedia("(min-width: 761px) and (hover: hover)").matches
          && !this.ageSelection?.pinned) this.openAgeBucket(bin, row);
      });
      row.addEventListener("focus", () => {
        if (row.matches(":focus-visible") && !this.ageSelection?.pinned) this.openAgeBucket(bin, row);
      });
      row.addEventListener("click", event => {
        if (this.ageSelection?.trigger === row && this.ageSelection.pinned) this.closeAgeBucket();
        else {
          this.openAgeBucket(bin, row, true);
          if (event.detail === 0) panel.querySelector("button").focus();
        }
      });
      const range = element("span", `${bin.fromYears}–${bin.toYears}`, "queue-histogram-range");
      const track = element("span", undefined, "queue-histogram-track");
      const bar = element("span", undefined, "queue-histogram-bar");
      bar.style.width = `${bin.count / maxCount * 100}%`;
      bar.append(element("span", String(bin.count), "queue-histogram-count"));
      track.append(bar);
      row.append(range, track);
      item.append(row);
      chart.append(item);
    }
    this.ui.ages.append(element("p", "Time in queue (years) · project count", "queue-histogram-axis"), chart,
      element("p", "Hover to preview projects. Click or tap to keep a bucket selected.", "queue-note"));
  }

  closeAgeBucket() {
    if (this.ageSelection) this.ageSelection.trigger.setAttribute("aria-expanded", "false");
    this.ageSelection = null;
    if (this.agePanel) this.agePanel.hidden = true;
    this.ui["bucket-empty"].hidden = false;
    this.updateMapHighlight();
  }

  openAgeBucket(bin, trigger, pinned = false) {
    if (this.ageSelection?.trigger === trigger) {
      this.ageSelection.pinned ||= pinned;
      return;
    }
    if (this.ageSelection) this.ageSelection.trigger.setAttribute("aria-expanded", "false");
    const projects = this.filtered.filter(p => isInQueueAgeBin(this.days(p), bin)).sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
    this.ageSelection = {bin, trigger, pinned, projectIds: new Set(projects.map(p => p.id))};
    trigger.setAttribute("aria-expanded", "true");
    const heading = element("h3", `${bin.fromYears}–${bin.toYears} years · ${projects.length} projects`);
    heading.id = "queue-age-projects-title";
    const close = element("button", "Close ×");
    close.type = "button";
    close.addEventListener("click", () => { trigger.focus(); this.closeAgeBucket(); });
    const header = element("div", undefined, "queue-bucket-heading");
    header.append(heading, close);
    const note = element("p", undefined, "queue-note");
    note.dataset.bucketMapNote = "";
    const list = element("ul", undefined, "queue-bucket-list");
    projects.forEach(p => {
      const item = element("li");
      const link = element("button", p.name || `Queue ${p.id}`, "queue-bucket-project");
      link.type = "button";
      link.addEventListener("click", () => { this.ageSelection.pinned = true; this.showProject(p); });
      item.append(
        link,
        element("span", `${countyLabel(p.county)}, ${p.state || "State not reported"}`, "queue-bucket-location"),
        componentCapacities(p.components),
      );
      list.append(item);
    });
    if (!projects.length) list.append(element("li", "No projects in this interval."));
    const showMap = element("button", "View highlighted map ↑", "queue-bucket-show-map");
    showMap.type = "button";
    showMap.addEventListener("click", () => {
      this.ageSelection.pinned = true;
      document.getElementById("queue-location-title").scrollIntoView({behavior: "smooth", block: "start"});
      this.ui["clear-highlight"].focus({preventScroll: true});
    });
    this.agePanel.replaceChildren(header, note, list, showMap);
    this.agePanel.hidden = false;
    this.ui["bucket-empty"].hidden = true;
    this.updateMapHighlight();
  }

  updateMapHighlight() {
    const selected = this.ageSelection;
    this.markerRecords.forEach(({marker, projects}) => {
      const highlighted = selected && projects.some(p => selected.projectIds.has(p.id));
      marker.setStyle({color: "#173f78", weight: highlighted ? 3 : 1.3,
        opacity: selected && !highlighted ? .25 : 1,
        fillColor: highlighted ? "#173f78" : "#bf7956", fillOpacity: selected ? (highlighted ? .9 : .12) : .7});
      if (highlighted) marker.bringToFront();
    });
    this.ui["highlight-controls"].hidden = !selected;
    if (!selected) return;
    const mappedCount = [...selected.projectIds].filter(id => this.matches.get(id)).length;
    const caption = `${selected.bin.fromYears}–${selected.bin.toYears} years: ${selected.projectIds.size} projects. `
      + (this.mapUnavailable ? "The map is unavailable." : !this.map ? "Map locations are loading." : `${mappedCount} have matched map locations; ${selected.projectIds.size - mappedCount} are not mapped.${mappedCount ? " Blue circles contain at least one project in this bucket." : ""}`);
    this.ui["highlight-note"].textContent = caption;
    const panelNote = this.agePanel.querySelector("[data-bucket-map-note]");
    if (panelNote) panelNote.textContent = caption;
  }

  selectPoi(poi) {
    this.ui.search.value = poi;
    this.render();
    document.getElementById("queue-age-title").scrollIntoView({behavior: "smooth", block: "start"});
  }

  renderMap() {
    const matched = this.filtered.filter(p => this.matches.get(p.id));
    this.ui["map-note"].textContent = this.mapUnavailable ? "Map unavailable. Use the filters and age intervals to explore projects." : `${matched.length} of ${this.filtered.length} selected projects matched to reference substations. Circles scale with project count. Unmatched projects are included in the filters and totals. Dashed outline: CAISO area, 2021 reference.`;
    if (!this.markers) { this.updateMapHighlight(); return; }
    this.markers.clearLayers();
    this.markerRecords = [];
    const groups = new Map();
    matched.forEach(p => { const f = this.matches.get(p.id); const key = JSON.stringify(f.geometry.coordinates); if (!groups.has(key)) groups.set(key, {feature: f, projects: []}); groups.get(key).projects.push(p); });
    groups.forEach(({feature, projects}) => {
      const [lon, lat] = feature.geometry.coordinates;
      const tooltip = element("div", `${feature.properties.Name} · ${projects.length} projects`);
      const popup = element("div"); popup.append(element("strong", feature.properties.Name));
      const button = element("button", "Search this connection name");
      button.addEventListener("click", () => {
        this.selectPoi(feature.properties.Name);
      });
      popup.append(element("p", "Reference substation location"), button);
      const marker = L.circleMarker([lat, lon], {radius: 5 + Math.sqrt(projects.length) * 3, color: "#173f78", weight: 1.3, fillColor: "#bf7956", fillOpacity: .7}).bindTooltip(tooltip).bindPopup(popup).addTo(this.markers);
      this.markerRecords.push({marker, projects});
    });
    this.updateMapHighlight();
  }

  showProject(p) {
    const source = this.sources.find(s => s.id === p.sourceId);
    const content = this.ui.detail;
    const heading = element("h2", p.name); heading.id = "queue-detail-title";
    content.replaceChildren(heading, element("p", `Queue ${p.id} · ${p.status.toLowerCase()} · ${p.studyProcess}`, "eyebrow"));
    content.append(element("p", technology(p), "queue-detail-technology"));
    const components = element("section", undefined, "queue-detail-components");
    components.append(element("h3", "Technology components"), componentCapacities(p.components));
    content.append(components);
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
