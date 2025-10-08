/**
 * CAISO OASIS API Integration
 * Fetches live California grid data for visualization
 */

class CAISOData {
  constructor() {
    this.baseURL = '/api/grid-data'; // Use Vercel Edge Function
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Fetch Locational Marginal Pricing (LMP) data
   * Shows economic stress on the grid
   */
  async getLMPData(date = null) {
    return this.fetchData('lmp', { type: 'lmp' });
  }

  /**
   * Fetch transmission constraint data
   * Shows bottlenecks and grid stress points
   */
  async getConstraintData(date = null) {
    return this.fetchData('constraints', { type: 'constraints' });
  }

  /**
   * Fetch system load forecast vs actual
   * Shows overall grid demand
   */
  async getSystemLoadData(date = null) {
    return this.fetchData('systemload', { type: 'load' });
  }

  /**
   * Generic data fetcher with caching
   */
  async fetchData(cacheKey, params) {
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < this.cacheTimeout)) {
      return cached.data;
    }

    try {
      const url = this.buildURL(params);
      console.log('Fetching CAISO data via Vercel function:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Log if we're getting mock data due to API error
      if (result.source && result.source.includes('Mock')) {
        console.warn('Received mock data:', result.error);
      }
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      return result;
    } catch (error) {
      console.error('Error fetching CAISO data:', error);
      
      // Return cached data if available, even if stale
      const cached = this.cache.get(cacheKey);
      if (cached) {
        console.warn('Using stale cached data due to fetch error');
        return cached.data;
      }
      
      // Return mock data for development (unified array shape)
      return {
        type: params.type,
        timestamp: new Date().toISOString(),
        data: this.getMockData(cacheKey),
        source: 'Local Mock Data'
      };
    }
  }

  /**
   * Build URL with parameters for Vercel function
   */
  buildURL(params) {
    const searchParams = new URLSearchParams(params);
    return `${this.baseURL}?${searchParams.toString()}`;
  }

  /**
   * Get current date in YYYYMMDD format
   */
  getCurrentDateString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  /**
   * Mock data for development/testing
   */
  getMockData(type) {
    const t = String(type).toLowerCase();
    if (t === 'lmp') {
      return [
        { node: 'SLAP_PGE-APND', lmp_price: 45.2, timestamp: new Date().toISOString() },
        { node: 'SP15_EHV-APND', lmp_price: 52.1, timestamp: new Date().toISOString() },
        { node: 'NP15_EHV-APND', lmp_price: 38.7, timestamp: new Date().toISOString() },
        { node: 'ZP26_7_N001', lmp_price: 61.4, timestamp: new Date().toISOString() }
      ];
    }
    if (t === 'constraints') {
      return [
        { constraint_name: 'PDCI_S', shadow_price: 12.5, status: 'BINDING' },
        { constraint_name: 'COTP2G_NG_1_UNIT', shadow_price: 0, status: 'NOT_BINDING' }
      ];
    }
    if (t === 'systemload' || t === 'load') {
      return [ { forecast_load: 28450, actual_load: 28890, timestamp: new Date().toISOString() } ];
    }
    return [];
  }

  /**
   * Process LMP data for visualization
   * Returns array of {location, price, color} objects
   */
  processLMPForVisualization(lmpData) {
    if (!lmpData || !lmpData.data) return [];

    return lmpData.data.map(item => {
      const price = parseFloat(item.lmp_price || 0);
      return {
        node: item.node,
        price: price,
        color: this.priceToColor(price),
        intensity: this.priceToIntensity(price)
      };
    });
  }

  /**
   * Convert price to color (green = low, red = high)
   * Matches legend: <$30 = green, $30-60 = yellow, >$60 = red
   */
  priceToColor(price) {
    if (price < 30) {
      // Low price: Green
      return '#90EE90'; // Light green
    } else if (price <= 60) {
      // Medium price: Yellow
      return '#FFD700'; // Gold
    } else {
      // High price: Red  
      return '#FF6347'; // Tomato red
    }
  }

  /**
   * Convert price to animation intensity
   */
  priceToIntensity(price) {
    return Math.min(Math.max(price / 50, 0.1), 1);
  }
}

// Export for use in other modules
window.CAISOData = CAISOData;
