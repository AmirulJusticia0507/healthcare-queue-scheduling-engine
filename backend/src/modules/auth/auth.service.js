const pool = require('../../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const JWT_EXPIRES_IN = '8h';

async function createUser({ name, email, password, role = 'staff' }) {
  const password_hash = await bcrypt.hash(password, 10);
  const res = await pool.query(
    'INSERT INTO users(name, email, password_hash, role) VALUES($1, $2, $3, $4) RETURNING id, name, email, role',
    [name, email, password_hash, role]
  );
  return res.rows[0];
}

async function getAllUsers() {
  const res = await pool.query('SELECT id, name, email, role, doctor_id, created_at FROM users ORDER BY id ASC');
  return res.rows;
}

async function getUserById(id) {
  const res = await pool.query('SELECT id, name, email, role, doctor_id, created_at FROM users WHERE id = $1', [id]);
  return res.rows[0];
}

async function getUserByEmail(email) {
  const res = await pool.query(
    'SELECT id, name, email, password_hash, role FROM users WHERE email = $1',
    [email]
  );
  return res.rows[0];
}

async function updateUser(id, { name, email, role, doctorId }) {
  const fields = [];
  const params = [];
  if (name !== undefined) { params.push(name); fields.push(`name = $${params.length}`); }
  if (email !== undefined) { params.push(email); fields.push(`email = $${params.length}`); }
  if (role !== undefined) { params.push(role); fields.push(`role = $${params.length}`); }
  if (doctorId !== undefined) { params.push(doctorId); fields.push(`doctor_id = $${params.length}`); }
  if (fields.length === 0) return getUserById(id);
  params.push(id);
  const res = await pool.query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${params.length} RETURNING id, name, email, role, doctor_id`,
    params
  );
  return res.rows[0];
}

async function resetPassword(id, newPassword) {
  const password_hash = await bcrypt.hash(newPassword, 10);
  const res = await pool.query(
    'UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING id, name, email, role',
    [password_hash, id]
  );
  return res.rows[0];
}

async function changePassword(userId, currentPassword, newPassword) {
  const user = await pool.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
  if (user.rows.length === 0) throw new Error('User not found');
  const ok = await bcrypt.compare(currentPassword, user.rows[0].password_hash);
  if (!ok) throw new Error('Password lama salah');
  const password_hash = await bcrypt.hash(newPassword, 10);
  await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [password_hash, userId]);
  return true;
}

async function deleteUser(id) {
  const res = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id, name, email, role', [id]);
  return res.rows[0];
}

async function logLogin({ userId, email, ipAddress, success, userAgent }) {
  await pool.query(
    'INSERT INTO login_logs(user_id, email, ip_address, success, user_agent) VALUES($1, $2, $3, $4, $5)',
    [userId || null, email, ipAddress || null, success !== false, userAgent || null]
  );
}

async function getLoginLogs({ page = 1, limit = 30, userId } = {}) {
  const where = [];
  const params = [];
  if (userId) { params.push(userId); where.push(`user_id = $${params.length}`); }
  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = (Number(page) - 1) * Number(limit);

  const listRes = await pool.query(
    `SELECT ll.*, u.name AS user_name FROM login_logs ll
     LEFT JOIN users u ON ll.user_id = u.id
     ${whereClause} ORDER BY ll.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, Number(limit), offset]
  );
  const countRes = await pool.query(`SELECT COUNT(*)::int AS n FROM login_logs ${whereClause}`, params);

  return {
    items: listRes.rows,
    total: countRes.rows[0].n,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(countRes.rows[0].n / Number(limit)) || 1,
  };
}

async function verifyUser(email, password) {
  const user = await getUserByEmail(email);
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return null;
  const token = jwt.sign({ sub: user.id, name: user.name, email: user.email, role: user.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
  return { user: { id: user.id, name: user.name, email: user.email, role: user.role }, token };
}

module.exports = {
  createUser, getAllUsers, getUserById, getUserByEmail,
  updateUser, resetPassword, changePassword, deleteUser,
  logLogin, getLoginLogs, verifyUser, JWT_SECRET,
};
