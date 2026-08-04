/**
 * Middleware untuk validasi service-to-service API key.
 * Header: X-API-Key: <api_key>
 */
function validateIntegrationKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  const expectedKey = process.env.INTEGRATION_API_KEY;

  if (!expectedKey) {
    console.error('INTEGRATION_API_KEY not configured in healthcare .env');
    return res.status(500).json({ error: 'Integration not configured' });
  }

  if (!apiKey) {
    return res.status(401).json({ error: 'Missing X-API-Key header' });
  }

  if (apiKey !== expectedKey) {
    return res.status(403).json({ error: 'Invalid API key' });
  }

  next();
}

module.exports = { validateIntegrationKey };
