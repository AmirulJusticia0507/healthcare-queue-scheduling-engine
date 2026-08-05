const bcrypt = require('bcryptjs');
const pool = require('../src/config/database');

const USERS = [
  { name: 'Admin', email: 'admin@health.id', password: 'admin123', role: 'admin' },
  { name: 'Staff', email: 'staff@health.id', password: 'staff123', role: 'staff' },
  { name: 'Dr. Sari', email: 'dokter@health.id', password: 'dokter123', role: 'doctor' },
];

const DOCTORS = [
  { name: 'Dr. Sari', avg_consult_time: 15 },
  { name: 'Dr. Budi', avg_consult_time: 20 },
  { name: 'Dr. Andi', avg_consult_time: 10 },
];

// Sample patients with external_id matching testDNA seed
const PATIENTS = [
  { name: 'Budi Santoso', patient_external_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', clinic_id: 1 },
  { name: 'Siti Rahayu', patient_external_id: 'b2c3d4e5-f6a7-8901-bcde-f23456789012', clinic_id: 1 },
  { name: 'Ahmad Wijaya', patient_external_id: 'c3d4e5f6-a7b8-9012-cdef-345678901234', clinic_id: 1 },
];

async function upsertUser(u) {
  const existing = await pool.query(
    'SELECT id, password_hash FROM users WHERE email = $1',
    [u.email]
  );
  if (existing.rows.length > 0) {
    const pwOk = await bcrypt.compare(u.password, existing.rows[0].password_hash);
    if (!pwOk) {
      const hash = await bcrypt.hash(u.password, 10);
      await pool.query(
        'UPDATE users SET name = $1, password_hash = $2, role = $3 WHERE id = $4',
        [u.name, hash, u.role, existing.rows[0].id]
      );
      console.log(`Reset password & role for ${u.email} (${u.role})`);
    } else {
      await pool.query('UPDATE users SET name = $1, role = $2 WHERE id = $3', [u.name, u.role, existing.rows[0].id]);
    }
    return;
  }
  const hash = await bcrypt.hash(u.password, 10);
  await pool.query(
    'INSERT INTO users(name, email, password_hash, role) VALUES($1, $2, $3, $4)',
    [u.name, u.email, hash, u.role]
  );
  console.log(`Seeded user ${u.email} (${u.role})`);
}

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

  await pool.query(`
    CREATE TABLE IF NOT EXISTS clinics (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      code VARCHAR(50) NOT NULL UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // Seed default clinic
  const c = await pool.query('SELECT id FROM clinics WHERE code = $1', ['general']);
  let clinicId = c.rows[0]?.id;
  if (!clinicId) {
    const inserted = await pool.query(
      'INSERT INTO clinics(name, code) VALUES($1, $2) RETURNING id',
      ['Umum', 'general']
    );
    clinicId = inserted.rows[0].id;
    console.log(`Seeded clinic: Umum (id=${clinicId})`);
  }

  for (const u of USERS) await upsertUser(u);

  const docCount = await pool.query('SELECT COUNT(*)::int AS n FROM doctors');
  if (Number(docCount.rows[0].n) === 0) {
    for (const d of DOCTORS) {
      await pool.query('INSERT INTO doctors(name, avg_consult_time, clinic_id) VALUES($1, $2, $3)', [d.name, d.avg_consult_time, clinicId]);
    }
    console.log('Seeded doctors:', DOCTORS.length);
  } else {
    console.log('Doctors already present, skipping.');
  }

  // Seed patients with external_id for DNA bridge
  for (const p of PATIENTS) {
    const existing = await pool.query('SELECT id FROM queue_entries WHERE patient_external_id = $1', [p.patient_external_id]);
    if (existing.rows.length === 0) {
      await pool.query(
        'INSERT INTO queue_entries(patient_name, patient_external_id, clinic_id, status) VALUES($1, $2, $3, $4)',
        [p.name, p.patient_external_id, p.clinic_id, 'waiting']
      );
      console.log(`Seeded patient: ${p.name} (external_id: ${p.patient_external_id})`);
    } else {
      console.log(`Patient with external_id ${p.patient_external_id} already exists, skipping.`);
    }
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
