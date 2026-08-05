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

  // patient_external_id for DNA bridge
  const extCols = await pool.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name='queue_entries' AND column_name='patient_external_id'"
  );
  if (extCols.rows.length === 0) {
    await pool.query(`ALTER TABLE queue_entries ADD COLUMN patient_external_id VARCHAR(255)`);
    console.log('Added patient_external_id to queue_entries');
  }

  // clinical_notes for doctor notes
  const notesCols = await pool.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name='queue_entries' AND column_name='clinical_notes'"
  );
  if (notesCols.rows.length === 0) {
    await pool.query(`ALTER TABLE queue_entries ADD COLUMN clinical_notes TEXT`);
    console.log('Added clinical_notes to queue_entries');
  }

  // doctor_id for persistent doctor assignment
  const doctorIdCols = await pool.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name='queue_entries' AND column_name='doctor_id'"
  );
  if (doctorIdCols.rows.length === 0) {
    await pool.query(`ALTER TABLE queue_entries ADD COLUMN doctor_id INT`);
    console.log('Added doctor_id to queue_entries');
  }

  // external_id for doctors (bridge to DNA system)
  const doctorExtCols = await pool.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name='doctors' AND column_name='external_id'"
  );
  if (doctorExtCols.rows.length === 0) {
    await pool.query(`ALTER TABLE doctors ADD COLUMN external_id VARCHAR(255)`);
    console.log('Added external_id to doctors');
  }

  // patients table for patient management
  const patientsExists = await pool.query(
    "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name='patients')"
  );
  if (!patientsExists.rows[0].exists) {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS patients (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        date_of_birth DATE,
        gender VARCHAR(20),
        phone VARCHAR(50),
        email VARCHAR(255),
        address TEXT,
        medical_record_number VARCHAR(100) UNIQUE,
        external_id VARCHAR(255),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    console.log('Created patients table');
  }

  // patient_id FK on queue_entries
  const patientIdCols = await pool.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name='queue_entries' AND column_name='patient_id'"
  );
  if (patientIdCols.rows.length === 0) {
    await pool.query(`ALTER TABLE queue_entries ADD COLUMN patient_id INT`);
    console.log('Added patient_id to queue_entries');
  }

  // doctor_id column on users (for doctor role)
  const userDoctorIdCols = await pool.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name='doctor_id'"
  );
  if (userDoctorIdCols.rows.length === 0) {
    await pool.query('ALTER TABLE users ADD COLUMN doctor_id INT');
    console.log('Added doctor_id to users');
  }

  // appointments table
  const appointmentsExists = await pool.query(
    "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name='appointments')"
  );
  if (!appointmentsExists.rows[0].exists) {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        patient_id INT NOT NULL REFERENCES patients(id),
        doctor_id INT NOT NULL REFERENCES doctors(id),
        clinic_id INT NOT NULL DEFAULT ${clinicId},
        appointment_date DATE NOT NULL,
        appointment_time TIME NOT NULL,
        reason TEXT,
        notes TEXT,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await pool.query('CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments (appointment_date)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments (doctor_id)');
    console.log('Created appointments table');
  }

  // audit_logs table
  const auditExists = await pool.query(
    "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name='audit_logs')"
  );
  if (!auditExists.rows[0].exists) {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INT,
        action VARCHAR(255) NOT NULL,
        entity_type VARCHAR(100),
        entity_id INT,
        details TEXT,
        ip_address VARCHAR(50),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await pool.query('CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs (entity_type, entity_id)');
    console.log('Created audit_logs table');
  }

  // notifications table
  const notifExists = await pool.query(
    "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name='notifications')"
  );
  if (!notifExists.rows[0].exists) {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(20) DEFAULT 'info',
        link VARCHAR(255),
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await pool.query('CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications (user_id, is_read)');
    console.log('Created notifications table');
  }

  // webhooks table
  const webhookExists = await pool.query(
    "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name='webhooks')"
  );
  if (!webhookExists.rows[0].exists) {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS webhooks (
        id SERIAL PRIMARY KEY,
        url VARCHAR(500) NOT NULL,
        events TEXT[] DEFAULT '{*}',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    console.log('Created webhooks table');
  }

  // archived_queue_entries table for data retention
  const archivedExists = await pool.query(
    "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name='archived_queue_entries')"
  );
  if (!archivedExists.rows[0].exists) {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS archived_queue_entries (
        LIKE queue_entries INCLUDING ALL,
        archived_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    console.log('Created archived_queue_entries table');
  }
}

up()
  .then(() => { console.log('Migration complete.'); process.exit(0); })
  .catch((err) => { console.error('Migration failed:', err); process.exit(1); });
