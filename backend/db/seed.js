const bcrypt = require('bcryptjs');
const pool = require('../src/config/database');

const DEFAULT_ADMIN = {
  name: 'Admin',
  email: 'admin@health.id',
  password: 'admin123',
  role: 'admin',
};

// Seed dokter default (sama seperti data awal)
const DOCTORS = [
  { name: 'Dr. Sari', avg_consult_time: 15 },
  { name: 'Dr. Budi', avg_consult_time: 20 },
  { name: 'Dr. Andi', avg_consult_time: 10 },
];

async function main() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'staff',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [DEFAULT_ADMIN.email]);
  if (existing.rows.length > 0) {
    console.log(`Admin already exists (id=${existing.rows[0].id}), skipping seed.`);
    const pwOk = await bcrypt.compare(DEFAULT_ADMIN.password, existing.rows[0].password_hash);
    if (!pwOk) {
      console.warn('Existing admin password mismatch with seed — re-hashing.');
      const hash = await bcrypt.hash(DEFAULT_ADMIN.password, 10);
      await pool.query('UPDATE users SET password_hash = $1 WHERE email = $2', [hash, DEFAULT_ADMIN.email]);
      console.log('Admin password re-seeded.');
    }
    return;
  }

  const password_hash = await bcrypt.hash(DEFAULT_ADMIN.password, 10);
  const res = await pool.query(
    'INSERT INTO users(name, email, password_hash, role) VALUES($1, $2, $3, $4) RETURNING id, name, email, role',
    [DEFAULT_ADMIN.name, DEFAULT_ADMIN.email, password_hash, DEFAULT_ADMIN.role]
  );
  console.log('Seeded admin user:', res.rows[0]);

  // Seed doctors if none
  const docCount = await pool.query('SELECT COUNT(*)::int AS n FROM doctors');
  if (Number(docCount.rows[0].n) === 0) {
    for (const d of DOCTORS) {
      await pool.query('INSERT INTO doctors(name, avg_consult_time) VALUES($1, $2)', [d.name, d.avg_consult_time]);
    }
    console.log('Seeded doctors:', DOCTORS.length);
  } else {
    console.log('Doctors already present, skipping.');
  }
}

main()
  .then(() => {
    console.log('Seed complete.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
