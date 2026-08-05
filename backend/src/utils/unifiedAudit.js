const axios = require('axios');

const HEALTHCARE_API = process.env.HEALTHCARE_API_BASE || 'http://localhost:5000';
const TESTDNA_API = process.env.TESTDNA_API_BASE || 'http://localhost:3000';
const INTEGRATION_API_KEY = process.env.INTEGRATION_API_KEY;

function headers() {
  return INTEGRATION_API_KEY ? { 'X-API-Key': INTEGRATION_API_KEY } : {};
}

async function getUnifiedAudit({ page = 1, limit = 50 } = {}) {
  const [hcAudit, tdUsers] = await Promise.allSettled([
    axios.get(`${HEALTHCARE_API}/api/audit`, { params: { page, limit }, headers: headers(), timeout: 5000 }),
    axios.get(`${TESTDNA_API}/users/logs`, { params: { page, limit }, timeout: 5000 }),
  ]);

  const items = [];

  if (hcAudit.status === 'fulfilled' && hcAudit.value.data?.items) {
    items.push(...hcAudit.value.data.items.map(i => ({
      ...i, source: 'healthcare',
    })));
  }

  if (tdUsers.status === 'fulfilled' && tdUsers.value.data) {
    const logs = Array.isArray(tdUsers.value.data) ? tdUsers.value.data : tdUsers.value.data.logs || [];
    items.push(...logs.map(i => ({
      id: i.id,
      action: i.action || 'login',
      entity_type: 'user',
      details: `${i.email || i.user_email || ''} - ${i.action || 'login'}`,
      created_at: i.created_at || i.createdAt,
      source: 'testdna',
    })));
  }

  items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return {
    items: items.slice(0, limit),
    total: items.length,
    page,
  };
}

module.exports = { getUnifiedAudit };
