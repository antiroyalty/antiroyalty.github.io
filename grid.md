---
layout: default
title: California Grid Map
permalink: /grid/
---

<div class="hero">
  <p class="eyebrow">Interaction prototype</p>
  <h1>California Grid Map</h1>
  <p class="lead">An experimental visualization of California's electrical grid and market geography.</p>
</div>

<div id="grid-map" class="grid-map-container">
  <div class="grid-loading">
    Initializing map prototype<span class="retro-cursor"></span>
  </div>
</div>

<div class="grid-info">
  <h2>About This Prototype</h2>
  <p>This interactive map explores how several kinds of California grid information might be combined, including:</p>
  <ul>
    <li><strong>Locational Marginal Pricing (LMP)</strong> - Economic signals showing grid stress</li>
    <li><strong>System Load</strong> - System-wide electricity demand</li>
    <li><strong>Transmission Constraints</strong> - Bottlenecks in the grid infrastructure</li>
    <li><strong>Major Substations</strong> - Key nodes in the transmission network</li>
  </ul>
  
  <h3>How to Read the Map</h3>
  <p>Price indicators are color-coded: green represents low electricity prices (under $30/MWh), yellow shows medium prices ($30-60/MWh), and red indicates high prices (over $60/MWh). Higher prices typically signal grid stress, high demand, or transmission constraints.</p>
  
  <p>Substations pulse gently and transmission lines show animated flow patterns. Click any element for more information.</p>
  
  <div class="data-note">
    <strong>Prototype note:</strong> Market values in this map are fixed illustrative samples. They are not live and should not be used for analysis. The live Electricity Desk on the homepage uses verified CAISO snapshots.
  </div>
</div>

<!-- Load required libraries -->
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<link rel="stylesheet" href="{{ '/assets/css/grid-map.css' | relative_url }}">

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="{{ '/assets/js/caiso-api.js' | relative_url }}"></script>
<script src="{{ '/assets/js/grid-map.js' | relative_url }}"></script>

<script>
let gridMap = null;

document.addEventListener('DOMContentLoaded', function() {
  console.log('Initializing California grid map prototype...');
  
  // Check if required libraries are loaded
  if (typeof L === 'undefined') {
    console.error('Leaflet not loaded');
    return;
  }
  
  if (typeof CAISOData === 'undefined') {
    console.error('CAISO API not loaded');
    return;
  }
  
  // Initialize the grid map
  try {
    gridMap = new GridMap('grid-map');
    console.log('Grid map initialized successfully');
    
    // Remove loading indicator after initialization
    setTimeout(() => {
      const loadingEl = document.querySelector('.grid-loading');
      if (loadingEl) {
        loadingEl.style.opacity = '0';
        setTimeout(() => {
          loadingEl.style.display = 'none';
        }, 500);
      }
    }, 3000);
    
  } catch (error) {
    console.error('Error initializing grid map:', error);
    
    // Show error message
    const container = document.getElementById('grid-map');
    if (container) {
      container.innerHTML = `
        <div class="grid-error">
          Error loading grid visualization: ${error.message}
          <br>Check console for details.
        </div>
      `;
    }
  }
  
  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    if (gridMap) {
      gridMap.destroy();
    }
  });
});
</script>
