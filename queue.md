---
layout: default
title: "What's in the queue?"
description: Explore where proposed power plants and storage projects want to connect to the CAISO grid, their technologies, and their time in the queue.
permalink: /queue/
---

<section class="queue-page" data-queue-explorer data-endpoint="{{ '/assets/data/queue/' | relative_url }}" data-annual-endpoint="{{ '/assets/data/queue-annual/' | relative_url }}" data-substations="{{ '/assets/data/california-substations.geojson' | relative_url }}" data-area="{{ '/assets/data/caiso-area-reference.geojson' | relative_url }}">
  <nav class="queue-nav" aria-label="Grid explorers"><a href="{{ '/grid/' | relative_url }}">Grid today ↗</a><span aria-current="page">Interconnection queue</span></nav>
  <header class="queue-hero">
    <p class="eyebrow">CAISO · Proposed generation + storage</p>
    <h1>What's in the queue?</h1>
    <p class="queue-lead">Where developers want to build, what they propose, and how long their projects have been in the interconnection queue.</p>
    <p class="queue-note" data-q="edition" role="status">Loading public CAISO queue reports…</p>
  </header>
  <noscript><p>This explorer needs JavaScript. <a href="https://www.caiso.com/documents/publicqueuereport.xlsx">Download the CAISO queue</a> or <a href="https://www.caiso.com/documents/cluster-15-interconnection-requests.xlsx">Cluster 15 report</a>.</p></noscript>
  <div data-q="content" hidden>
    <div class="queue-summary" aria-live="polite" data-q="summary"></div>
    <p class="queue-note">Capacity is the reported net MW at the grid connection, counted once per project. Proposals are not a forecast of what will be built.</p>
    <div class="queue-geography">
      <div class="queue-connection-filter" data-q="connection-filter" hidden>
        <p><span class="eyebrow">Connection filter</span><strong data-q="connection-filter-label" role="status"></strong></p>
        <button type="button" data-q="clear-connection">Clear connection filter ×</button>
      </div>
      <div class="queue-map-layout">
        <section class="queue-map-section" aria-labelledby="queue-location-title">
          <div class="queue-section-heading"><div><p class="eyebrow">01 / Connection points</p><h2 id="queue-location-title">Where projects want to connect</h2></div><button type="button" data-q="map-reset">Reset map</button></div>
          <div class="queue-map-container"><div id="queue-map" aria-label="Reference map of matched project connection substations"><p>Loading substation reference map…</p></div><p class="queue-note" data-q="map-note"></p><div class="queue-map-highlight" data-q="highlight-controls" hidden><p class="queue-note" data-q="highlight-note" role="status"></p><button type="button" data-q="clear-highlight">Clear bucket highlight</button></div></div>
        </section>
        <section aria-labelledby="queue-age-title"><p class="eyebrow">02 / Time in the queue</p><h2 id="queue-age-title" tabindex="-1">How long has it been?</h2><p class="queue-note">Active projects: queue entry to each source report date. Completed or withdrawn projects: queue entry to the reported exit date.</p><div data-q="ages" class="queue-histogram"></div><p class="queue-note" data-q="age-note"></p></section>
        <aside class="queue-age-detail" aria-labelledby="queue-age-detail-title"><p class="eyebrow">Selected interval</p><h2 id="queue-age-detail-title">Projects in this interval</h2><p class="queue-note" data-q="bucket-empty">Hover over an age bar to see its projects here and highlight their map locations. Click or tap a bar to keep that interval selected.</p><div data-q="bucket-detail"></div></aside>
      </div>
    </div>
    <form class="queue-filters" aria-label="Filter projects">
      <div class="queue-observation-controls">
        <label>Queue observation<select data-q="snapshot" aria-describedby="queue-history-note" disabled></select></label>
        <p class="queue-note" id="queue-history-note">Saved observations, checked daily. Source report dates can differ from collection dates.</p>
      </div>
      <label class="queue-search">Find a project or connection<input type="search" data-q="search" placeholder="Name, connection, or queue ID"></label>
      <label>Technology<select data-q="technology"><option value="">All technologies</option></select></label>
      <label>State<select data-q="state"><option value="">All states</option></select></label>
      <label>County<select data-q="county"><option value="">All counties</option></select></label>
      <label>Status<select data-q="status"><option value="ACTIVE">Active</option><option value="COMPLETED">Completed</option><option value="WITHDRAWN">Withdrawn</option><option value="">All statuses</option></select></label>
      <button type="button" data-q="reset">Reset filters</button>
    </form>
    <div class="queue-chart-grid">
      <section><p class="eyebrow">03 / Proposed technologies</p><h2>What they want to build</h2><p class="queue-note">Project counts. Hybrid projects appear in one category.</p><div data-q="technologies" class="queue-bars"></div></section>
      <section class="queue-poi-list"><p class="eyebrow">04 / Most requested connections</p><h2>Where interest is concentrated</h2><p class="queue-note">Connection points with the most projects matching your search and dropdown filters. Select one to filter the map and charts; select it again to clear.</p><button type="button" class="queue-clear-connection" data-q="clear-connection-list" hidden>Clear connection filter ×</button><div data-q="connections"></div><p class="queue-note">Names are grouped as reported. Similar names may refer to the same facility.</p></section>
    </div>
    <section class="queue-history" aria-labelledby="queue-history-title">
      <p class="eyebrow">05 / The queue over time</p>
      <h2 id="queue-history-title">How is the queue changing?</h2>
      <div class="queue-history-modes" role="group" aria-label="History period">
        <button type="button" data-q="history-annual-button" aria-pressed="true" aria-controls="queue-annual-panel">Year-end · 2020–2025</button>
        <button type="button" data-q="history-weekly-button" aria-pressed="false" aria-controls="queue-weekly-panel">Recent weeks</button>
      </div>
      <div id="queue-annual-panel" data-q="history-annual-panel">
        <p class="queue-note">CAISO project counts in each year's Queued Up dataset, including completed and withdrawn records. Counts cover the full CAISO sample, independent of the filters above.</p>
        <div class="queue-history-legend" aria-label="Project status colors"><span><i class="queue-status-active"></i>Active</span><span><i class="queue-status-completed"></i>Completed</span><span><i class="queue-status-withdrawn"></i>Withdrawn</span><span><i class="queue-status-suspended"></i>Suspended</span></div>
        <p class="queue-history-axis-title">Projects</p>
        <div class="queue-history-chart" data-q="annual-chart" role="group" aria-label="Year-end CAISO project counts by status"><p class="queue-note">Loading annual history…</p></div>
        <p class="queue-history-readout" data-q="annual-hover" role="status"></p>
        <p class="queue-note" data-q="annual-selection" role="status"></p>
        <p class="queue-note" data-q="annual-source"></p>
        <p class="queue-note">Completed and withdrawn counts include earlier years; they are not new outcomes within that year. Source revisions and coverage changes can also change the totals. “Operational” is shown as “Completed.”</p>
        <p class="queue-note">Source: <a href="https://emp.lbl.gov/queues">Lawrence Berkeley National Laboratory and GridTracker, Queued Up</a> (<a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>). Adapted to CAISO project counts. These annual editions have different coverage from our recent CAISO observations. The map and project list use the recent observations.</p>
      </div>
      <div id="queue-weekly-panel" data-q="history-weekly-panel" hidden>
        <p class="queue-note">Project counts across the full reports, including completed and withdrawn projects. Each bar uses the latest saved observation in that Pacific week, independent of the filters above.</p>
        <div class="queue-history-legend" aria-label="Project status colors"><span><i class="queue-status-active"></i>Active</span><span><i class="queue-status-completed"></i>Completed</span><span><i class="queue-status-withdrawn"></i>Withdrawn</span></div>
        <p class="queue-history-axis-title">Projects</p>
        <div class="queue-history-chart" data-q="history-chart" role="group" aria-label="Weekly project counts by status"><p class="queue-note">Loading saved observations…</p></div>
        <p class="queue-history-readout" data-q="history-hover" role="status"></p>
        <p class="queue-note" data-q="history-selection" role="status"></p>
        <p class="queue-note">Dates label the start of each week. Weeks without a saved observation remain gaps; unchanged reports do not create new observations.</p>
        <details class="queue-history-changes" data-q="history-changes">
          <summary data-q="changes-summary">Changes since the previous observation</summary>
          <p class="queue-note" data-q="change-note" role="status"></p>
          <div class="queue-history-list" data-q="changes"></div>
          <p class="queue-note">Changes cover the full reports, independent of filters. They show what changed between our observations, not when it happened.</p>
        </details>
      </div>
    </section>
    <details class="queue-method"><summary>Sources and how to read this</summary>
      <p>CAISO publishes Cluster 14 and earlier separately from Cluster 15. These editions can have different dates. This explorer includes projects outside California when they request connection to the CAISO-controlled grid.</p>
      <div data-q="sources"></div>
      <p>“Time in queue” measures elapsed calendar days, not a forecast of remaining wait or proof of a study delay. Active entries can include amendments to existing plants. Missing or inconsistent dates remain unavailable. Requested online dates are not commitments.</p>
      <p>The map matches normalized substation names, transmission owners, and counties against the site's public CEC substation reference. It shows connection substations, not project footprints. Line connections, proposed facilities, ambiguous names, and unmatched records remain included in the filters and totals. The dashed CAISO area is a retired 2021 reference.</p>
      <p>Technology categories use reported fuels. Solar and storage components can share one connection limit, so their individual MW values must not be added to infer net grid capacity.</p>
      <p>County filters combine capitalization and “County” suffix variations. Project details preserve the source spelling, including incomplete or inconsistent place names.</p>
      <p>Sources are checked daily by the site's data workflow after deployment. Changed project records create a new observation. Each weekly bar shows that week's latest saved observation. Original workbooks are retained with each source version. The first observation establishes the baseline; it cannot reveal earlier changes.</p>
      <p><a href="https://www.caiso.com/generation-transmission/generation/generator-interconnection">CAISO generator interconnection ↗</a> · <a href="https://www.arcgis.com/home/item.html?id=147c83114a3f4ff8a82225e3d6c24857">Historical area reference ↗</a></p>
    </details>
  </div>
  <dialog class="queue-dialog" data-q="dialog" aria-labelledby="queue-detail-title"><button type="button" data-q="close">Close ×</button><div data-q="detail"></div></dialog>
</section>

<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<link rel="stylesheet" href="{{ '/assets/css/queue.css' | relative_url }}?v={{ site.time | date: '%s' }}">
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script type="module" src="{{ '/assets/js/queue-view.js' | relative_url }}?v={{ site.time | date: '%s' }}"></script>
