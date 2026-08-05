-- Healthcare Queue Scheduling Engine - Database Schema

-- CREATE DATABASE healthcare_queue_db;

CREATE TABLE IF NOT EXISTS patients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  date_of_birth DATE,
  gender VARCHAR(20),
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  medical_record_number VARCHAR(100) UNIQUE,
  external_id VARCHAR(255), -- UUID bridge to DNA system
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS doctors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  avg_consult_time INT NOT NULL DEFAULT 15, -- in minutes
  available_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- when doctor is free again
  external_id VARCHAR(255), -- UUID bridge to DNA system
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS queue_entries (
  id SERIAL PRIMARY KEY,
  patient_name VARCHAR(255) NOT NULL,
  patient_id INT, -- FK to patients table
  patient_external_id VARCHAR(255), -- UUID from DNA system (legacy, use patient_id instead)
  doctor_id INT, -- assigned doctor (persisted)
  clinical_notes TEXT, -- Doctor's clinical notes
  status VARCHAR(20) NOT NULL DEFAULT 'waiting',
  -- status values: waiting | skipped | called | done
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_queue_entries_status ON queue_entries (status);
CREATE INDEX IF NOT EXISTS idx_queue_entries_joined_at ON queue_entries (joined_at);

-- Authentication
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL, -- bcrypt hash
  role VARCHAR(50) NOT NULL DEFAULT 'staff', -- admin | staff | doctor
  doctor_id INT, -- FK to doctors table (for doctor role)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- Multi-clinic
CREATE TABLE IF NOT EXISTS clinics (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Appointments
CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  patient_id INT NOT NULL REFERENCES patients(id),
  doctor_id INT NOT NULL REFERENCES doctors(id),
  clinic_id INT NOT NULL DEFAULT 1,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  reason TEXT,
  notes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  -- status values: pending | confirmed | completed | cancelled | no_show
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments (appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments (doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments (status);

-- Audit Trail
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INT,
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  entity_id INT,
  details TEXT,
  ip_address VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs (user_id);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'info', -- info | success | warning | error
  link VARCHAR(255),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications (user_id, is_read);

-- Clinic scoping (added later via db/migrate.js; declared here for fresh builds)
-- ALTER TABLE doctors ADD COLUMN clinic_id INT NOT NULL DEFAULT 1 REFERENCES clinics(id);
-- ALTER TABLE queue_entries ADD COLUMN clinic_id INT NOT NULL DEFAULT 1 REFERENCES clinics(id);

-- Seed (use db/seed.js to hash the password, or run this with a pre-computed bcrypt hash):
-- INSERT INTO users (name, email, password_hash, role)
-- VALUES ('Admin', 'admin@health.id', '$2a$10$<bcrypt-hash>', 'admin');
