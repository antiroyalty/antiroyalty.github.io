---
layout: default
title: California Grid Map
permalink: /grid/
---

<section class="grid-hero" aria-labelledby="grid-page-title">
  <p class="eyebrow">California market geography</p>
  <h1 id="grid-page-title">California Grid Map</h1>
  <p class="grid-lead">A live view of regional wholesale prices set against California's public high-voltage transmission network.</p>
</section>

<section
  class="grid-explorer"
  data-grid-explorer
  data-market-endpoint="{{ '/assets/data/grid-market.json' | relative_url }}"
  data-desk-endpoint="{{ '/assets/data/electricity-desk.json' | relative_url }}"
  data-lines-endpoint="{{ '/assets/data/california-transmission.geojson' | relative_url }}"
  data-substations-endpoint="{{ '/assets/data/california-substations.geojson' | relative_url }}"
  aria-labelledby="grid-explorer-title"
>
  <div class="grid-summary" aria-label="Current California grid summary">
    <article class="grid-summary-card grid-summary-card--spread">
      <p>North-south spread</p>
      <strong data-grid-field="spread">···</strong>
      <span data-grid-field="spread-direction">Comparing NP15 and SP15</span>
    </article>
    <article class="grid-summary-card">
      <p>System demand</p>
      <strong data-grid-field="demand">···</strong>
      <span data-grid-field="demand-detail">Loading the Electricity Desk</span>
    </article>
    <article class="grid-summary-card">
      <p>Grid batteries</p>
      <strong data-grid-field="battery">···</strong>
      <span data-grid-field="battery-detail">Reading storage activity</span>
    </article>
  </div>

  <div class="grid-workspace">
    <div class="grid-map-panel">
      <div class="grid-toolbar">
        <div>
          <p class="eyebrow" id="grid-explorer-title">Public infrastructure + live prices</p>
          <div class="grid-status" role="status" aria-live="polite">
            <span class="grid-status__light" aria-hidden="true"></span>
            <span data-grid-field="status">Connecting</span>
            <span class="grid-status__time" data-grid-field="interval"></span>
          </div>
        </div>
        <fieldset class="grid-layer-controls">
          <legend>Map layers</legend>
          <label><input type="checkbox" data-grid-layer="lower-voltage" checked> 220–287 kV</label>
          <label><input type="checkbox" data-grid-layer="higher-voltage" checked> 345–500 kV</label>
          <label><input type="checkbox" data-grid-layer="substations"> Substations</label>
          <label><input type="checkbox" data-grid-layer="prices" checked> Market hubs</label>
        </fieldset>
      </div>

      <div
        id="grid-map"
        class="grid-map-container"
        role="application"
        aria-label="Interactive map of California high-voltage transmission infrastructure and regional electricity prices"
      >
        <div class="grid-loading">Loading public infrastructure and CAISO prices</div>
      </div>

      <div class="grid-map-key" aria-label="Map legend">
        <span><i class="grid-key-line grid-key-line--lower"></i>220–287 kV</span>
        <span><i class="grid-key-line grid-key-line--higher"></i>345–500 kV</span>
        <span><i class="grid-key-dot grid-key-dot--negative"></i>negative price</span>
        <span><i class="grid-key-dot grid-key-dot--moderate"></i>$0–80/MWh</span>
        <span><i class="grid-key-dot grid-key-dot--high"></i>above $80/MWh</span>
      </div>
    </div>

    <aside class="grid-analysis" aria-live="polite">
      <div class="grid-insight">
        <p class="eyebrow">What the market is saying</p>
        <h2 data-grid-field="insight-title">Reading this interval</h2>
        <p data-grid-field="insight-summary">Waiting for a verified CAISO market snapshot.</p>
        <p class="grid-insight__driver" data-grid-field="insight-driver"></p>
      </div>

      <div class="grid-hubs" aria-label="Regional market hubs">
        <button type="button" data-grid-hub="NP15">
          <span><strong>NP15</strong> Northern California</span>
          <b data-hub-price="NP15">···</b>
        </button>
        <button type="button" data-grid-hub="ZP26">
          <span><strong>ZP26</strong> Central California</span>
          <b data-hub-price="ZP26">···</b>
        </button>
        <button type="button" data-grid-hub="SP15">
          <span><strong>SP15</strong> Southern California</span>
          <b data-hub-price="SP15">···</b>
        </button>
      </div>

      <div class="grid-detail" data-grid-detail hidden>
        <p class="eyebrow">Selected hub</p>
        <h3 data-grid-detail="name">NP15</h3>
        <p class="grid-detail__price" data-grid-detail="price">···</p>
        <dl>
          <div><dt>Marginal energy</dt><dd data-grid-detail="energy">···</dd></div>
          <div><dt>Congestion</dt><dd data-grid-detail="congestion">···</dd></div>
          <div><dt>Losses</dt><dd data-grid-detail="loss">···</dd></div>
        </dl>
        <p class="grid-detail__note">The three components reconcile to the locational marginal price.</p>
      </div>
    </aside>
  </div>

  <div class="grid-source-note">
    <p><strong>How to read this:</strong> A regional price gap is a market signal, not proof that a specific line is overloaded. Select a hub to see whether energy, congestion, or modeled losses are shaping its price.</p>
    <p>Infrastructure: <a href="https://lab.data.ca.gov/dataset/california-electric-transmission-lines">California Energy Commission</a>, approximate public geometry. Prices: <a href="https://oasis.caiso.com/oasisapi/prc_hub_lmp/PRC_HUB_LMP.html">California ISO OASIS</a>, five-minute hub LMPs. Informational data only.</p>
  </div>
</section>

<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<link rel="stylesheet" href="{{ '/assets/css/grid-map.css' | relative_url }}">
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script type="module" src="{{ '/assets/js/grid-map.js' | relative_url }}"></script>
