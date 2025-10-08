/**
 * Vercel Function for CAISO Grid Data
 * Fetches live California grid data without CORS issues
 */

const DEFAULT_LMP_NODES = [
  'NP15_EHV-APND',
  'SP15_EHV-APND',
  'ZP26_7_N001',
  'DLAP_PGE-APND',
  'DLAP_SCE-APND',
  'DLAP_SDGE-APND'
];

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
        caisoUrl = buildCAISOLmpUrl(currentDate, DEFAULT_LMP_NODES);
        break;
      case 'constraints':
        caisoUrl = buildCAISOUrl('PRC_CONSTRAINT', currentDate);
        break;
      case 'load':
        caisoUrl = buildCAISOUrl('SLD_FCST', currentDate);
        break;
      default:
        caisoUrl = buildCAISOLmpUrl(currentDate, DEFAULT_LMP_NODES);
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

    const raw = await response.json();

    // Normalize to frontend-expected shape
    let normalized;
    if (type === 'lmp') {
      normalized = normalizeLmp(raw);
    } else if (type === 'constraints') {
      normalized = normalizeConstraints(raw);
    } else if (type === 'load') {
      normalized = normalizeLoad(raw);
    }

    res.status(200).json({
      type,
      timestamp: new Date().toISOString(),
      date: currentDate,
      data: normalized,
      source: 'CAISO OASIS API'
    });
    
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
 * Build CAISO OASIS API URL (generic)
 */
function buildCAISOUrl(queryname, date, extraParams = {}) {
  const baseUrl = 'https://oasis.caiso.com/oasisapi/SingleEndpoint';
  const params = new URLSearchParams({
    queryname,
    version: queryname === 'PRC_LMP' ? '12' : '1',
    market_run_id: 'RTM',
    startdatetime: `${date}T00:00-0000`,
    enddatetime: `${date}T23:59-0000`,
    resultformat: '6', // JSON
    ...extraParams
  });
  return `${baseUrl}?${params.toString()}`;
}

/** Build LMP URL with required nodes */
function buildCAISOLmpUrl(date, nodes) {
  const extra = { node: (nodes || []).join(',') };
  return buildCAISOUrl('PRC_LMP', date, extra);
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

/**
 * Normalizers try to adapt OASIS JSON to the frontend shape expected
 */
function normalizeLmp(raw) {
  // Attempt to extract rows with PNODE and LMP values regardless of nesting
  const rows = deepFindRows(raw);
  const items = rows.map(r => {
    const lower = lowerKeys(r);
    const node = lower.node || lower.pnode || lower.pnode_name || lower.pnodeid || lower.pnode_id || lower.pnode_name || lower.pnode || lower.pnode || lower.pnode_name;
    const price = parseFloat(
      lower.lmp || lower.lmp_prc || lower.lmp_price || lower.px || lower.price || lower.p || lower.mwh || lower.value
    );
    return { node: String(node || 'UNKNOWN'), lmp_price: isFinite(price) ? price : 0, timestamp: new Date().toISOString() };
  }).filter(x => x.node);

  // If nothing parsed, return empty array; frontend will show mocks on error path
  return items;
}

function normalizeConstraints(raw) {
  const rows = deepFindRows(raw);
  return rows.map(r => {
    const lower = lowerKeys(r);
    return {
      constraint_name: lower.constraint_name || lower.constraint || lower.name || 'Constraint',
      shadow_price: parseFloat(lower.shadow_price || lower.price || 0),
      status: (lower.status || '').toString().toUpperCase() || 'NOT_BINDING'
    };
  });
}

function normalizeLoad(raw) {
  const rows = deepFindRows(raw);
  return rows.map(r => {
    const lower = lowerKeys(r);
    return {
      forecast_load: numberOrNull(lower.forecast_load || lower.load_forecast || lower.load_fcst || lower.forecast || lower.value),
      actual_load: numberOrNull(lower.actual_load || lower.load_actual || lower.actual),
      timestamp: new Date().toISOString()
    };
  });
}

function numberOrNull(v) {
  const n = parseFloat(v);
  return isFinite(n) ? n : null;
}

// Recursively find arrays of row-like objects inside OASIS JSON
function deepFindRows(obj) {
  const out = [];
  (function walk(x) {
    if (!x) return;
    if (Array.isArray(x)) {
      // If array of objects with > 1 key, treat them as rows
      if (x.length && typeof x[0] === 'object') out.push(...x);
      x.forEach(walk);
    } else if (typeof x === 'object') {
      Object.values(x).forEach(walk);
    }
  })(obj);
  return out;
}

function lowerKeys(obj) {
  const o = {};
  for (const [k, v] of Object.entries(obj)) o[k.toLowerCase()] = v;
  return o;
}
