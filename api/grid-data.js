/**
 * Vercel Edge Function for CAISO Grid Data
 * Fetches live California grid data without CORS issues
 */

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { type = 'lmp' } = req.query;
    const currentDate = getCurrentDateString();
    
    let caisoUrl;
    
    // Build CAISO API URL based on data type
    switch (type) {
      case 'lmp':
        caisoUrl = buildCAISOUrl('PRC_LMP', currentDate);
        break;
      case 'constraints':
        caisoUrl = buildCAISOUrl('PRC_CONSTRAINT', currentDate);
        break;
      case 'load':
        caisoUrl = buildCAISOUrl('SLD_FCST', currentDate);
        break;
      default:
        caisoUrl = buildCAISOUrl('PRC_LMP', currentDate);
    }

    console.log(`Fetching CAISO data: ${type} for ${currentDate}`);
    
    // Fetch from CAISO API
    const response = await fetch(caisoUrl, {
      headers: {
        'User-Agent': 'Grid-Visualization/1.0',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`CAISO API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Add metadata
    const enrichedData = {
      type: type,
      timestamp: new Date().toISOString(),
      date: currentDate,
      data: data,
      source: 'CAISO OASIS API'
    };

    res.status(200).json(enrichedData);
    
  } catch (error) {
    console.error('Error fetching CAISO data:', error);
    
    // Return mock data with error indication
    const mockData = getMockData(req.query.type || 'lmp');
    
    res.status(200).json({
      type: req.query.type || 'lmp',
      timestamp: new Date().toISOString(),
      date: getCurrentDateString(),
      data: mockData,
      source: 'Mock Data (API Error)',
      error: error.message
    });
  }
}

/**
 * Build CAISO OASIS API URL
 */
function buildCAISOUrl(queryname, date) {
  const baseUrl = 'https://oasis.caiso.com/oasisapi/SingleZip';
  
  const params = new URLSearchParams({
    queryname: queryname,
    version: queryname === 'PRC_LMP' ? '12' : '1',
    market_run_id: 'RTM', // Real-time market
    startdatetime: `${date}T00:00-0000`,
    enddatetime: `${date}T23:59-0000`,
    format: 'JSON'
  });
  
  return `${baseUrl}?${params.toString()}`;
}

/**
 * Get current date in YYYYMMDD format
 */
function getCurrentDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * Mock data for development/fallback
 */
function getMockData(type) {
  const mockData = {
    lmp: {
      data: [
        { node: 'SLAP_PGE-APND', lmp_price: 45.2 + Math.random() * 20, timestamp: new Date().toISOString() },
        { node: 'SP15_EHV-APND', lmp_price: 52.1 + Math.random() * 15, timestamp: new Date().toISOString() },
        { node: 'NP15_EHV-APND', lmp_price: 38.7 + Math.random() * 25, timestamp: new Date().toISOString() },
        { node: 'ZP26_7_N001', lmp_price: 61.4 + Math.random() * 10, timestamp: new Date().toISOString() },
        { node: 'DLAP_PGE-APND', lmp_price: 43.8 + Math.random() * 18, timestamp: new Date().toISOString() },
        { node: 'DLAP_SCE-APND', lmp_price: 48.9 + Math.random() * 22, timestamp: new Date().toISOString() }
      ]
    },
    constraints: {
      data: [
        { constraint_name: 'PDCI_S', shadow_price: 12.5 + Math.random() * 10, status: Math.random() > 0.7 ? 'BINDING' : 'NOT_BINDING' },
        { constraint_name: 'COTP2G_NG_1_UNIT', shadow_price: Math.random() * 5, status: 'NOT_BINDING' },
        { constraint_name: 'Path15_S_P15_SOUTH', shadow_price: Math.random() * 15, status: Math.random() > 0.8 ? 'BINDING' : 'NOT_BINDING' }
      ]
    },
    load: {
      data: [
        { 
          forecast_load: 28450 + Math.random() * 5000, 
          actual_load: 28890 + Math.random() * 4000, 
          timestamp: new Date().toISOString() 
        }
      ]
    }
  };

  return mockData[type] || { data: [] };
}