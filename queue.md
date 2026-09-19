---
layout: default
title: "What's in the queue?"
description: Explore where proposed power plants and storage projects want to connect to the CAISO grid, their technologies, and their time in the queue.
permalink: /queue/
---

<section class="queue-page" data-queue-explorer data-endpoint="{{ '/assets/data/queue/' | relative_url }}" data-substations="{{ '/assets/data/california-substations.geojson' | relative_url }}" data-area="{{ '/assets/data/caiso-area-reference.geojson' | relative_url }}">
  <nav class="queue-nav" aria-label="Grid explorers"><a href="{{ '/grid/' | relative_url }}">Grid today ↗</a><span aria-current="page">Interconnection queue</span></nav>
  <header class="queue-hero">
    <p class="eyebrow">CAISO · Proposed generation + storage</p>
    <h1>What's in the queue?</h1>
    <p class="queue-lead">Where developers want to build, what they propose, and how long their projects have been in the interconnection queue.</p>
    <p class="queue-note" data-q="edition" role="status">Loading public CAISO queue reports…</p>
  </header>
  <noscript><p>This explorer needs JavaScript. <a href="https://www.caiso.com/documents/publicqueuereport.xlsx">Download the CAISO queue</a> or <a href="https://www.caiso.com/documents/cluster-15-interconnection-requests.xlsx">Cluster 15 report</a>.</p></noscript>
  <div data-q="content" hidden>
    <form class="queue-filters" aria-label="Filter projects">
      <label class="queue-search">Find a project or connection point<input type="search" data-q="search" placeholder="Try Whirlwind, solar, or a queue number"></label>
      <label>Technology<select data-q="technology"><option value="">All technologies</option></select></label>
      <label>State<select data-q="state"><option value="">All states</option></select></label>
      <label>County<select data-q="county"><option value="">All counties</option></select></label>
      <label>Status<select data-q="status"><option value="ACTIVE">Active</option><option value="COMPLETED">Completed</option><option value="WITHDRAWN">Withdrawn</option><option value="">All statuses</option></select></label>
      <button type="button" data-q="reset">Reset filters</button>
    </form>
    <div class="queue-summary" aria-live="polite" data-q="summary"></div>
    <p class="queue-note">Capacity is the reported net MW at the grid connection, counted once per project. Proposals are not a forecast of what will be built.</p>
    <section class="queue-geography" aria-labelledby="queue-location-title">
      <div class="queue-section-heading"><div><p class="eyebrow">01 / Connection points</p><h2 id="queue-location-title">Where projects want to connect</h2></div><button type="button" data-q="map-reset">Reset map</button></div>
      <div class="queue-map-layout">
        <div><div id="queue-map" aria-label="Reference map of matched project connection substations"><p>Loading substation reference map…</p></div><p class="queue-note" data-q="map-note"></p></div>
        <div class="queue-poi-list"><p class="queue-note">Most requested connection points in this selection. Select one to explore its projects.</p><div data-q="connections"></div><p class="queue-note">Names are grouped as reported. Similar names may refer to the same facility.</p></div>
      </div>
    </section>
    <div class="queue-chart-grid">
      <section><p class="eyebrow">02 / Proposed technologies</p><h2>What they want to build</h2><p class="queue-note">Project counts. Hybrid projects appear in one category.</p><div data-q="technologies" class="queue-bars"></div></section>
      <section><p class="eyebrow">03 / Time in the queue</p><h2>How long has it been?</h2><p class="queue-note">Active projects: queue entry to each source report date. Completed or withdrawn projects: queue entry to the reported exit date.</p><div data-q="ages" class="queue-bars"></div><p class="queue-note" data-q="age-note"></p></section>
    </div>
    <section class="queue-projects" aria-labelledby="queue-project-title">
      <div class="queue-section-heading"><div><p class="eyebrow">04 / Project records</p><h2 id="queue-project-title">Look a little closer</h2></div><label>Sort by<select data-q="sort"><option value="capacity">Largest net MW</option><option value="age">Longest time in queue</option><option value="name">Project name</option></select></label></div>
      <p class="queue-note" data-q="results" role="status"></p>
      <div class="queue-table-scroll" tabindex="0" role="region" aria-label="Project records table"><table class="queue-table"><thead><tr><th scope="col">Project / queue ID</th><th scope="col">Technology</th><th scope="col">Connection point</th><th scope="col">Net MW</th><th scope="col">Time in queue</th><th scope="col">Status</th></tr></thead><tbody data-q="rows"></tbody></table></div>
      <div class="queue-pagination"><button type="button" data-q="previous">← Previous</button><span data-q="page"></span><button type="button" data-q="next">Next →</button></div>
    </section>
    <section class="queue-changes" aria-labelledby="queue-changes-title">
      <p class="eyebrow">05 / A queue in motion</p><h2 id="queue-changes-title">What changed?</h2>
      <label>Saved observation<select data-q="snapshot"></select></label>
      <p data-q="change-note"></p><div data-q="changes"></div>
      <p class="queue-note">Comparisons cover the full reports, independent of the filters above. A newly appearing record is not necessarily a new application; an absent record is not automatically a withdrawal.</p>
    </section>
    <details class="queue-method"><summary>Sources and how to read this</summary>
      <p>CAISO publishes Cluster 14 and earlier separately from Cluster 15. These editions can have different dates. This explorer includes projects outside California when they request connection to the CAISO-controlled grid.</p>
      <div data-q="sources"></div>
      <p>“Time in queue” measures elapsed calendar days, not a forecast of remaining wait or proof of a study delay. Active entries can include amendments to existing plants. Missing or inconsistent dates remain unavailable. Requested online dates are not commitments.</p>
      <p>The map matches normalized substation names, transmission owners, and counties against the site's public CEC substation reference. It shows connection substations, not project footprints. Line connections, proposed facilities, ambiguous names, and unmatched records remain in the table. The dashed CAISO area is a retired 2021 reference.</p>
      <p>Technology categories use reported fuels. Solar and storage components can share one connection limit, so their individual MW values must not be added to infer net grid capacity.</p>
      <p>County filters combine capitalization and “County” suffix variations. Project details preserve the source spelling, including incomplete or inconsistent place names.</p>
      <p>Sources are checked weekly by the site's data workflow after deployment. Changed project records create a new observation. Original workbooks are retained with each source version. The first observation establishes the baseline; it cannot reveal earlier changes.</p>
      <p><a href="https://www.caiso.com/generation-transmission/generation/generator-interconnection">CAISO generator interconnection ↗</a> · <a href="https://www.arcgis.com/home/item.html?id=147c83114a3f4ff8a82225e3d6c24857">Historical area reference ↗</a></p>
    </details>
  </div>
  <dialog class="queue-dialog" data-q="dialog" aria-labelledby="queue-detail-title"><button type="button" data-q="close">Close ×</button><div data-q="detail"></div></dialog>
</section>

<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<link rel="stylesheet" href="{{ '/assets/css/queue.css' | relative_url }}">
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script type="module" src="{{ '/assets/js/queue-view.js' | relative_url }}"></script>
