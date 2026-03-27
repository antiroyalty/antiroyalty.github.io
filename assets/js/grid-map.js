/**
 * California Grid Visualization Map
 * Interactive map showing live grid data with retro styling
 */

// Approximate coordinates for common CAISO nodes/zones
const PNODE_COORDS = {
  'NP15_EHV-APND': [37.7, -121.9],
  'SP15_EHV-APND': [34.05, -118.25],
  'ZP26_7_N001': [36.5, -119.8],
  'DLAP_PGE-APND': [37.77, -122.27],
  'DLAP_SCE-APND': [33.93, -117.94],
  'DLAP_SDGE-APND': [32.8, -117.1],
  'SLAP_PGE-APND': [37.7, -122.0]
};

class GridMap {
  constructor(containerId) {
    this.containerId = containerId;
    this.map = null;
    this.caisoData = new CAISOData();
    this.layers = {
      substations: null,
      transmissionLines: null,
      lmpOverlay: null
    };
    this.updateInterval = null;
    
    this.init();
  }

  /**
   * Initialize the map
   */
  init() {
    this.createMap();
    this.setupControls();
    this.startDataUpdates();
  }

  /**
   * Create the base Leaflet map
   */
  createMap() {
    // Initialize map centered on California
    this.map = L.map(this.containerId, {
      center: [36.7783, -119.4179], // California center
      zoom: 6,
      zoomControl: false, // We'll add custom controls
      attributionControl: false,
      preferCanvas: true // Better performance for animations
    });

    // Add base tile layer with retro styling
    const baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 10,
      minZoom: 5,
      className: 'retro-map-tiles'
    });
    
    baseLayer.addTo(this.map);

    // Custom zoom control with retro styling
    const zoomControl = L.control.zoom({
      position: 'topright'
    });
    zoomControl.addTo(this.map);

    // Fit map to California bounds
    const californiaBounds = [
      [32.5, -124.4], // Southwest
      [42.0, -114.1]  // Northeast
    ];
    this.map.fitBounds(californiaBounds, { padding: [20, 20] });
  }

  /**
   * Setup map controls and info panels
   */
  setupControls() {
    // Add legend control
    const legend = L.control({ position: 'bottomleft' });
    legend.onAdd = () => {
      const div = L.DomUtil.create('div', 'grid-legend');
      div.innerHTML = `
        <div class="legend-title">CA Grid Status</div>
        <div class="legend-item">
          <span class="legend-color" style="background: #90EE90"></span>
          Low Price (&lt;$30/MWh)
        </div>
        <div class="legend-item">
          <span class="legend-color" style="background: #FFD700"></span>
          Medium Price ($30-60/MWh)
        </div>
        <div class="legend-item">
          <span class="legend-color" style="background: #FF6347"></span>
          High Price (&gt;$60/MWh)
        </div>
        <div class="legend-update">
          Last updated: <span id="last-data-update">Loading...</span>
          <br>
          Source: <span id="data-source-status" class="status-badge">Checking…</span>
        </div>
      `;
      return div;
    };
    legend.addTo(this.map);

    // Add data info control
    const dataInfo = L.control({ position: 'topright' });
    dataInfo.onAdd = () => {
      const div = L.DomUtil.create('div', 'grid-data-info');
      div.innerHTML = `
        <div class="data-title" id="data-title">Grid Data</div>
        <div id="grid-stats">
          <div>System Load: <span id="system-load">--</span> MW</div>
          <div>Avg Price: <span id="avg-price">--</span> $/MWh</div>
          <div>Constraints: <span id="active-constraints">--</span></div>
        </div>
      `;
      return div;
    };
    dataInfo.addTo(this.map);
  }

  /**
   * Load static transmission infrastructure data
   */
  async loadInfrastructureData() {
    try {
      // Expanded substation data with more California substations
      const mockSubstations = [
        // 500kV Major Substations
        { name: 'Midway', lat: 35.0528, lng: -119.0890, voltage: 500, type: 'major' },
        { name: 'Vincent', lat: 34.4944, lng: -118.4261, voltage: 500, type: 'major' },
        { name: 'Sylmar', lat: 34.3075, lng: -118.4386, voltage: 500, type: 'major' },
        { name: 'Tesla', lat: 37.5600, lng: -121.1958, voltage: 500, type: 'major' },
        { name: 'Round Mountain', lat: 40.2100, lng: -121.6400, voltage: 500, type: 'major' },
        { name: 'Malin', lat: 42.0131, lng: -121.4000, voltage: 500, type: 'major' },
        { name: 'Path 15 (Gates)', lat: 36.6500, lng: -121.1000, voltage: 500, type: 'major' },
        { name: 'Diablo Canyon', lat: 35.2110, lng: -120.8520, voltage: 500, type: 'major' },
        { name: 'Moss Landing', lat: 36.8020, lng: -121.7880, voltage: 500, type: 'major' },
        { name: 'Helms', lat: 37.0000, lng: -119.2000, voltage: 500, type: 'major' },
        
        // 230kV Regional Substations
        { name: 'Panoche', lat: 36.7000, lng: -120.8500, voltage: 230, type: 'regional' },
        { name: 'Los Banos', lat: 37.0586, lng: -120.8499, voltage: 230, type: 'regional' },
        { name: 'Tracy', lat: 37.7397, lng: -121.4252, voltage: 230, type: 'regional' },
        { name: 'Vaca Dixon', lat: 38.3656, lng: -121.9018, voltage: 230, type: 'regional' },
        { name: 'Rio Oso', lat: 38.9517, lng: -121.5364, voltage: 230, type: 'regional' },
        { name: 'Table Mountain', lat: 39.4925, lng: -121.6169, voltage: 230, type: 'regional' },
        { name: 'Metcalf', lat: 37.2431, lng: -121.7244, voltage: 230, type: 'regional' },
        { name: 'Newark', lat: 37.5297, lng: -122.0402, voltage: 230, type: 'regional' },
        { name: 'Pittsburg', lat: 38.0280, lng: -121.8847, voltage: 230, type: 'regional' },
        { name: 'Olinda', lat: 33.8781, lng: -117.8531, voltage: 230, type: 'regional' },
        { name: 'Valley', lat: 34.1808, lng: -118.3258, voltage: 230, type: 'regional' },
        { name: 'Rinaldi', lat: 34.2547, lng: -118.5123, voltage: 230, type: 'regional' },
        { name: 'Lugo', lat: 34.3572, lng: -117.4097, voltage: 230, type: 'regional' },
        { name: 'San Bernardino', lat: 34.1083, lng: -117.2898, voltage: 230, type: 'regional' },
        { name: 'Devers', lat: 33.9289, lng: -116.8097, voltage: 230, type: 'regional' },
        { name: 'Imperial Valley', lat: 32.8431, lng: -115.3831, voltage: 230, type: 'regional' },
        { name: 'Miguel', lat: 32.6431, lng: -116.9431, voltage: 230, type: 'regional' },
        { name: 'Sycamore', lat: 32.9831, lng: -117.1131, voltage: 230, type: 'regional' },
        
        // 115kV Local Substations
        { name: 'Fresno', lat: 36.7378, lng: -119.7871, voltage: 115, type: 'local' },
        { name: 'Bakersfield', lat: 35.3733, lng: -119.0187, voltage: 115, type: 'local' },
        { name: 'Stockton', lat: 37.9577, lng: -121.2908, voltage: 115, type: 'local' },
        { name: 'Modesto', lat: 37.6391, lng: -120.9969, voltage: 115, type: 'local' },
        { name: 'Sacramento', lat: 38.5816, lng: -121.4944, voltage: 115, type: 'local' },
        { name: 'San Jose', lat: 37.3382, lng: -121.8863, voltage: 115, type: 'local' },
        { name: 'Oakland', lat: 37.8044, lng: -122.2711, voltage: 115, type: 'local' },
        { name: 'San Francisco', lat: 37.7749, lng: -122.4194, voltage: 115, type: 'local' },
        { name: 'Santa Barbara', lat: 34.4208, lng: -119.6982, voltage: 115, type: 'local' },
        { name: 'Ventura', lat: 34.2746, lng: -119.2290, voltage: 115, type: 'local' },
        { name: 'Riverside', lat: 33.9533, lng: -117.3962, voltage: 115, type: 'local' },
        { name: 'San Diego', lat: 32.7157, lng: -117.1611, voltage: 115, type: 'local' }
      ];

      // Add substations to map
      this.layers.substations = L.layerGroup();
      
      mockSubstations.forEach(substation => {
        let radius, fillColor;
        
        // Size and color based on voltage level
        switch(substation.type) {
          case 'major':
            radius = 10;
            fillColor = '#8B0000'; // Dark red for 500kV
            break;
          case 'regional':
            radius = 7;
            fillColor = '#DAA520'; // Golden rod for 230kV
            break;
          case 'local':
            radius = 4;
            fillColor = '#8B4513'; // Brown for 115kV
            break;
          default:
            radius = 5;
            fillColor = '#8B4513';
        }
        
        const marker = L.circleMarker([substation.lat, substation.lng], {
          radius: radius,
          fillColor: fillColor,
          color: '#333',
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8,
          className: 'substation-marker'
        });

        marker.bindPopup(`
          <div class="substation-popup">
            <h3>${substation.name}</h3>
            <p>Voltage: ${substation.voltage}kV</p>
            <p>Type: ${substation.type}</p>
          </div>
        `);

        this.layers.substations.addLayer(marker);
      });

      this.layers.substations.addTo(this.map);

      // Add major transmission lines
      this.addTransmissionLines(mockSubstations);

    } catch (error) {
      console.error('Error loading infrastructure data:', error);
    }
  }

  /**
   * Add transmission lines between major substations
   */
  addTransmissionLines(substations) {
    this.layers.transmissionLines = L.layerGroup();

    // Define major transmission connections based on actual CA grid topology
    const connections = [
      // 500kV Major Backbone
      ['Midway', 'Vincent'],
      ['Vincent', 'Sylmar'],
      ['Tesla', 'Round Mountain'],
      ['Tesla', 'Midway'],
      ['Round Mountain', 'Malin'],
      ['Tesla', 'Newark'],
      ['Tesla', 'Metcalf'],
      ['Midway', 'Path 15 (Gates)'],
      ['Path 15 (Gates)', 'Tesla'],
      ['Diablo Canyon', 'Midway'],
      ['Moss Landing', 'Tesla'],
      ['Moss Landing', 'Metcalf'],
      ['Helms', 'Tesla'],
      ['Helms', 'Midway'],
      
      // 230kV Regional Connections
      ['Tesla', 'Tracy'],
      ['Tesla', 'Pittsburg'],
      ['Tracy', 'Vaca Dixon'],
      ['Vaca Dixon', 'Rio Oso'],
      ['Rio Oso', 'Table Mountain'],
      ['Table Mountain', 'Round Mountain'],
      ['Tesla', 'Los Banos'],
      ['Los Banos', 'Panoche'],
      ['Panoche', 'Path 15 (Gates)'],
      ['Vincent', 'Valley'],
      ['Vincent', 'Rinaldi'],
      ['Vincent', 'Lugo'],
      ['Lugo', 'San Bernardino'],
      ['San Bernardino', 'Devers'],
      ['Vincent', 'Olinda'],
      ['Devers', 'Imperial Valley'],
      ['Miguel', 'Sycamore'],
      ['Sycamore', 'San Diego'],
      
      // 115kV Local Networks (major cities)
      ['Tesla', 'San Jose'],
      ['Tesla', 'Oakland'],
      ['Oakland', 'San Francisco'],
      ['Tesla', 'Stockton'],
      ['Tesla', 'Modesto'],
      ['Vaca Dixon', 'Sacramento'],
      ['Midway', 'Fresno'],
      ['Midway', 'Bakersfield'],
      ['Vincent', 'Santa Barbara'],
      ['Vincent', 'Ventura'],
      ['Lugo', 'Riverside'],
      ['Miguel', 'San Diego']
    ];

    connections.forEach(([from, to]) => {
      const fromStation = substations.find(s => s.name === from);
      const toStation = substations.find(s => s.name === to);

      if (fromStation && toStation) {
        // Line styling based on voltage levels
        let lineColor, lineWeight;
        const maxVoltage = Math.max(fromStation.voltage, toStation.voltage);
        
        if (maxVoltage >= 500) {
          lineColor = '#8B0000'; // Dark red for 500kV
          lineWeight = 4;
        } else if (maxVoltage >= 230) {
          lineColor = '#DAA520'; // Golden rod for 230kV
          lineWeight = 3;
        } else {
          lineColor = '#8B4513'; // Brown for 115kV
          lineWeight = 2;
        }
        
        const line = L.polyline([
          [fromStation.lat, fromStation.lng],
          [toStation.lat, toStation.lng]
        ], {
          color: lineColor,
          weight: lineWeight,
          opacity: 0.7,
          className: 'transmission-line'
        });

        line.bindPopup(`
          <div class="transmission-popup">
            <h4>${from} ↔ ${to}</h4>
            <p>Voltage: ${maxVoltage}kV</p>
            <p>Length: ${this.calculateDistance(fromStation, toStation).toFixed(1)} km</p>
          </div>
        `);

        this.layers.transmissionLines.addLayer(line);
      }
    });

    this.layers.transmissionLines.addTo(this.map);
  }

  /**
   * Update map with live CAISO data
   */
  async updateLiveData() {
    try {
      // Fetch latest data
      const [lmpData, constraintData, loadData] = await Promise.all([
        this.caisoData.getLMPData(),
        this.caisoData.getConstraintData(),
        this.caisoData.getSystemLoadData()
      ]);

      // Update LMP visualization
      this.updateLMPVisualization(lmpData);
      
      // Update statistics display
      this.updateStats(lmpData, constraintData, loadData);
      
      // Update timestamp
      document.getElementById('last-data-update').textContent = 
        new Date().toLocaleTimeString();

    } catch (error) {
      console.error('Error updating live data:', error);
    }
  }

  /**
   * Update LMP price visualization
   */
  updateLMPVisualization(lmpData) {
    // Remove existing LMP overlay
    if (this.layers.lmpOverlay) {
      this.map.removeLayer(this.layers.lmpOverlay);
    }

    // Process LMP data
    const processedData = this.caisoData.processLMPForVisualization(lmpData);
    
    this.layers.lmpOverlay = L.layerGroup();

    // Add price indicators
    processedData.forEach(item => {
      // Place by known PNODE coordinates; fallback to random if unknown
      const coords = this.resolveNodeCoords(item.node);
      const lat = coords[0];
      const lng = coords[1];

      const circle = L.circleMarker([lat, lng], {
        radius: 6 + (item.intensity * 10),
        fillColor: item.color,
        color: '#333',
        weight: 1,
        opacity: 0.8,
        fillOpacity: 0.6,
        className: 'lmp-indicator pulsing'
      });

      circle.bindPopup(`
        <div class="lmp-popup">
          <h4>Node: ${item.node}</h4>
          <p>Price: $${item.price.toFixed(2)}/MWh</p>
        </div>
      `);

      this.layers.lmpOverlay.addLayer(circle);
    });

    this.layers.lmpOverlay.addTo(this.map);
  }

  /**
   * Resolve approximate coordinates for a given node name
   */
  resolveNodeCoords(node) {
    if (!node) {
      return [32.5 + Math.random() * 9.5, -124.4 + Math.random() * 10.3];
    }
    const key = String(node).trim().toUpperCase();
    if (PNODE_COORDS[key]) return PNODE_COORDS[key];
    // Try to map zones by prefix
    if (key.startsWith('NP15')) return PNODE_COORDS['NP15_EHV-APND'];
    if (key.startsWith('SP15')) return PNODE_COORDS['SP15_EHV-APND'];
    if (key.startsWith('ZP26')) return PNODE_COORDS['ZP26_7_N001'];
    if (key.includes('DLAP_PGE')) return PNODE_COORDS['DLAP_PGE-APND'];
    if (key.includes('DLAP_SCE')) return PNODE_COORDS['DLAP_SCE-APND'];
    if (key.includes('DLAP_SDGE')) return PNODE_COORDS['DLAP_SDGE-APND'];
    // Fallback random within CA bounds
    return [32.5 + Math.random() * 9.5, -124.4 + Math.random() * 10.3];
  }

  /**
   * Update statistics display
   */
  updateStats(lmpData, constraintData, loadData) {
    // Calculate average price
    if (lmpData && lmpData.data && lmpData.data.length > 0) {
      const avgPrice = lmpData.data.reduce((sum, item) => 
        sum + parseFloat(item.lmp_price || 0), 0) / lmpData.data.length;
      document.getElementById('avg-price').textContent = `$${avgPrice.toFixed(2)}`;
    }

    // Display system load
    if (loadData && loadData.data && loadData.data.length > 0) {
      const load = loadData.data[0].actual_load || loadData.data[0].forecast_load;
      document.getElementById('system-load').textContent = 
        load ? load.toLocaleString() : '--';
    }

    // Count active constraints
    if (constraintData && constraintData.data) {
      const activeConstraints = constraintData.data.filter(
        c => c.status === 'BINDING').length;
      document.getElementById('active-constraints').textContent = activeConstraints;
    }

    // Update source badge based on data origin
    this.updateSourceBadge(lmpData);
  }

  /**
   * Start automatic data updates
   */
  startDataUpdates() {
    // Load infrastructure first
    this.loadInfrastructureData();
    
    // Update live data immediately
    this.updateLiveData();
    
    // Set up interval for updates (every 5 minutes)
    this.updateInterval = setInterval(() => {
      this.updateLiveData();
    }, 5 * 60 * 1000);
  }

  /**
   * Stop automatic updates
   */
  stopDataUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Update the UI badge to show Live vs Mock
   */
  updateSourceBadge(lmpData) {
    const el = document.getElementById('data-source-status');
    if (!el) return;
    const src = (lmpData && lmpData.source) ? String(lmpData.source) : '';
    const isLive = src.toLowerCase().includes('caiso') && !src.toLowerCase().includes('mock');
    el.textContent = isLive ? 'Live' : 'Mock';
    el.classList.toggle('live', isLive);
    el.classList.toggle('mock', !isLive);

    const titleEl = document.getElementById('data-title');
    if (titleEl) {
      titleEl.textContent = isLive ? 'Live Grid Data' : 'Mock Data (Demo)';
    }
  }

  /**
   * Calculate distance between two points in kilometers
   */
  calculateDistance(point1, point2) {
    const R = 6371; // Earth's radius in km
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLng = (point2.lng - point1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * Destroy the map and clean up
   */
  destroy() {
    this.stopDataUpdates();
    if (this.map) {
      this.map.remove();
    }
  }
}

// Export for global use
window.GridMap = GridMap;
