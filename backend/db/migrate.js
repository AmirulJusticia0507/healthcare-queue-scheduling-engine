const pool = require('../src/config/database');

async function up() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS clinics (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      code VARCHAR(50) UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  const c = await pool.query('SELECT id FROM clinics WHERE code = $1', ['general']);
  if (c.rows.length === 0) {
    await pool.query(
      'INSERT INTO clinics(name, code) VALUES($1, $2) ON CONFLICT (code) DO NOTHING RETURNING id',
      ['Umum', 'general']
    );
    console.log('Seeded clinic: Umum (general)');
  }

  const defaultClinic = await pool.query('SELECT id FROM clinics WHERE code = $1', ['general']);
  const clinicId = defaultClinic.rows[0].id;

  const doctorCols = await pool.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name='doctors' AND column_name='clinic_id'"
  );
  if (doctorCols.rows.length === 0) {
    await pool.query(`ALTER TABLE doctors ADD COLUMN clinic_id INT DEFAULT ${clinicId}`);
    console.log('Added clinic_id to doctors');
  } else {
    await pool.query('UPDATE doctors SET clinic_id = $1 WHERE clinic_id IS NULL', [clinicId]);
    console.log('Backfilled doctors clinic_id');
  }

  const entryCols = await pool.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name='queue_entries' AND column_name='clinic_id'"
  );
  if (entryCols.rows.length === 0) {
    await pool.query(`ALTER TABLE queue_entries ADD COLUMN clinic_id INT DEFAULT ${clinicId}`);
    console.log('Added clinic_id to queue_entries');
  } else {
    await pool.query('UPDATE queue_entries SET clinic_id = $1 WHERE clinic_id IS NULL', [clinicId]);
    console.log('Backfilled queue_entries clinic_id');
  }
}

up()
  .then(() => { console.log('Migration complete.'); process.exit(0); })
  .catch((err) => { console.error('Migration failed:', err); process.exit(1); });
