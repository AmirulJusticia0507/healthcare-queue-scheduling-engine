-- Healthcare Queue Scheduling Engine - Database Schema

-- CREATE DATABASE healthcare_queue_db;

CREATE TABLE IF NOT EXISTS doctors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  avg_consult_time INT NOT NULL DEFAULT 15, -- in minutes
  available_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- when doctor is free again
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS queue_entries (
  id SERIAL PRIMARY KEY,
  patient_name VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'waiting',
  -- status values: waiting | skipped | called | done
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_queue_entries_status ON queue_entries (status);
CREATE INDEX IF NOT EXISTS idx_queue_entries_joined_at ON queue_entries (joined_at);
