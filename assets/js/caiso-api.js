/**
 * California grid map prototype data
 * Uses a fixed illustrative dataset until a verified market-data pipeline is added
 */

class CAISOData {
  constructor() {
    this.cache = new Map();
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
   * Return a clearly labeled illustrative dataset
   */
  async fetchData(cacheKey, params) {
    return {
      type: params.type,
      timestamp: null,
      data: this.getPrototypeData(cacheKey),
      source: 'Illustrative prototype data'
    };
  }

  /**
   * Fixed sample values for the map interaction prototype
   */
  getPrototypeData(type) {
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
