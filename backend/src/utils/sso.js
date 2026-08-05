const jwt = require('jsonwebtoken');
const axios = require('axios');

const JWT_SECRET = process.env.JWT_SECRET || 'shared-secret-change-in-production';
const HEALTHCARE_API = process.env.HEALTHCARE_API_BASE || 'http://localhost:5000';
const TESTDNA_API = process.env.TESTDNA_API_BASE || 'http://localhost:3000';

/**
 * SSO: verify token from either system.
 * Healthcare tokens: { sub, name, email, role }
 * testDNA tokens: { id, email, role }
 */
async function verifySharedToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { valid: true, user: decoded, source: 'local' };
  } catch {
    // Try verifying against the other system
    try {
      const res = await axios.get(`${HEALTHCARE_API}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 3000,
      });
      if (res.data?.user) return { valid: true, user: res.data.user, source: 'healthcare' };
    } catch {}
    try {
      const res = await axios.get(`${TESTDNA_API}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 3000,
      });
      if (res.data?.user) return { valid: true, user: res.data.user, source: 'testdna' };
    } catch {}
    return { valid: false };
  }
}

module.exports = { verifySharedToken, JWT_SECRET };
