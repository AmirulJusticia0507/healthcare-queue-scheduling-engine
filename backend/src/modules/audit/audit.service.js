const pool = require('../../config/database');

async function log({ userId, action, entityType, entityId, details, ipAddress }) {
  await pool.query(
    `INSERT INTO audit_logs(user_id, action, entity_type, entity_id, details, ip_address)
     VALUES($1, $2, $3, $4, $5, $6)`,
    [userId || null, action, entityType || null, entityId || null, details || null, ipAddress || null]
  );
}

async function getAuditLogs({ page = 1, limit = 50, entityType, userId } = {}) {
  const where = [];
  const params = [];

  if (entityType) {
    params.push(entityType);
    where.push(`entity_type = $${params.length}`);
  }
  if (userId) {
    params.push(userId);
    where.push(`user_id = $${params.length}`);
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = (Number(page) - 1) * Number(limit);

  const listRes = await pool.query(
    `SELECT al.*, u.name AS user_name, u.email AS user_email
     FROM audit_logs al
     LEFT JOIN users u ON al.user_id = u.id
     ${whereClause}
     ORDER BY al.created_at DESC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, Number(limit), offset]
  );

  const countRes = await pool.query(
    `SELECT COUNT(*)::int AS n FROM audit_logs ${whereClause}`,
    params
  );

  return {
    items: listRes.rows,
    total: countRes.rows[0].n,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(countRes.rows[0].n / Number(limit)) || 1,
  };
}

module.exports = { log, getAuditLogs };
