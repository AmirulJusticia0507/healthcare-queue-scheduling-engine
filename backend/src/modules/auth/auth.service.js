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

async function getUserByEmail(email) {
  const res = await pool.query(
    'SELECT id, name, email, password_hash, role FROM users WHERE email = $1',
    [email]
  );
  return res.rows[0];
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

module.exports = { createUser, getUserByEmail, verifyUser, JWT_SECRET };
