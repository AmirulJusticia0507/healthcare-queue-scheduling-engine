const pool = require('../../config/database');

async function getNotifications(userId, { page = 1, limit = 20, unreadOnly = false } = {}) {
  const where = ['user_id = $1'];
  const params = [userId];

  if (unreadOnly) {
    where.push('is_read = FALSE');
  }

  const whereClause = `WHERE ${where.join(' AND ')}`;
  const offset = (Number(page) - 1) * Number(limit);

  const listRes = await pool.query(
    `SELECT * FROM notifications ${whereClause} ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, Number(limit), offset]
  );

  const countRes = await pool.query(
    `SELECT COUNT(*)::int AS n FROM notifications ${whereClause}`,
    params
  );

  const unreadRes = await pool.query(
    'SELECT COUNT(*)::int AS n FROM notifications WHERE user_id = $1 AND is_read = FALSE',
    [userId]
  );

  return {
    items: listRes.rows,
    total: countRes.rows[0].n,
    unreadCount: unreadRes.rows[0].n,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(countRes.rows[0].n / Number(limit)) || 1,
  };
}

async function createNotification(userId, { title, message, type = 'info', link }) {
  const res = await pool.query(
    `INSERT INTO notifications(user_id, title, message, type, link)
     VALUES($1, $2, $3, $4, $5) RETURNING *`,
    [userId, title, message, type, link || null]
  );
  return res.rows[0];
}

async function markAsRead(id, userId) {
  const res = await pool.query(
    'UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2 RETURNING *',
    [id, userId]
  );
  return res.rows[0];
}

async function markAllAsRead(userId) {
  await pool.query(
    'UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE',
    [userId]
  );
}

async function deleteNotification(id, userId) {
  const res = await pool.query(
    'DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING *',
    [id, userId]
  );
  return res.rows[0];
}

module.exports = { getNotifications, createNotification, markAsRead, markAllAsRead, deleteNotification };
