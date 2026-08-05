const pool = require('../../config/database');
const axios = require('axios');
const logger = require('../../utils/logger');

async function registerWebhook(url, events) {
  const res = await pool.query(
    'INSERT INTO webhooks(url, events) VALUES($1, $2) RETURNING *',
    [url, events || ['*']]
  );
  return res.rows[0];
}

async function getWebhooks() {
  const res = await pool.query('SELECT * FROM webhooks ORDER BY id ASC');
  return res.rows;
}

async function deleteWebhook(id) {
  const res = await pool.query('DELETE FROM webhooks WHERE id = $1 RETURNING *', [id]);
  return res.rows[0];
}

async function triggerWebhooks(event, payload) {
  const res = await pool.query(
    "SELECT * FROM webhooks WHERE $1 = ANY(events) OR '*' = ANY(events)",
    [event]
  );
  for (const wh of res.rows) {
    axios.post(wh.url, { event, payload, timestamp: new Date().toISOString() }, { timeout: 5000 })
      .then(() => logger.info(`Webhook delivered: ${event} → ${wh.url}`))
      .catch(err => logger.error(`Webhook failed: ${event} → ${wh.url}`, { error: err.message }));
  }
}

module.exports = { registerWebhook, getWebhooks, deleteWebhook, triggerWebhooks };
