const pool = require('../../config/database');

async function getQueueStats(clinicId) {
  const today = new Date().toISOString().split('T')[0];

  const [waitingRes, doneRes, totalRes, avgWaitRes, doctorRes, dailyRes, statusRes] = await Promise.all([
    pool.query("SELECT COUNT(*)::int AS n FROM queue_entries WHERE status = 'waiting' AND clinic_id = $1", [clinicId]),
    pool.query("SELECT COUNT(*)::int AS n FROM queue_entries WHERE status = 'done' AND clinic_id = $1", [clinicId]),
    pool.query('SELECT COUNT(*)::int AS n FROM queue_entries WHERE clinic_id = $1', [clinicId]),
    pool.query(
      `SELECT AVG(EXTRACT(EPOCH FROM (updated_at - joined_at)) / 60)::int AS avg_wait_minutes
       FROM queue_entries WHERE status = 'done' AND clinic_id = $1`,
      [clinicId]
    ),
    pool.query('SELECT COUNT(*)::int AS n FROM doctors WHERE clinic_id = $1', [clinicId]),
    pool.query(
      `SELECT DATE(joined_at) AS date, COUNT(*)::int AS count
       FROM queue_entries WHERE clinic_id = $1
       GROUP BY DATE(joined_at) ORDER BY date DESC LIMIT 30`,
      [clinicId]
    ),
    pool.query(
      `SELECT status, COUNT(*)::int AS count
       FROM queue_entries WHERE clinic_id = $1
       GROUP BY status`,
      [clinicId]
    ),
  ]);

  return {
    today: {
      waiting: waitingRes.rows[0].n,
      done: doneRes.rows[0].n,
      total: totalRes.rows[0].n,
      avgWaitMinutes: avgWaitRes.rows[0].avg_wait_minutes || 0,
    },
    doctors: doctorRes.rows[0].n,
    daily: dailyRes.rows,
    statusBreakdown: statusRes.rows,
  };
}

async function getAppointmentStats(clinicId) {
  const today = new Date().toISOString().split('T')[0];

  const [todayApptsRes, upcomingRes, statusRes] = await Promise.all([
    pool.query(
      "SELECT COUNT(*)::int AS n FROM appointments WHERE clinic_id = $1 AND appointment_date = $2 AND status != 'cancelled'",
      [clinicId, today]
    ),
    pool.query(
      "SELECT COUNT(*)::int AS n FROM appointments WHERE clinic_id = $1 AND appointment_date >= $2 AND status = 'confirmed'",
      [clinicId, today]
    ),
    pool.query(
      `SELECT status, COUNT(*)::int AS count
       FROM appointments WHERE clinic_id = $1
       GROUP BY status`,
      [clinicId]
    ),
  ]);

  return {
    todayCount: todayApptsRes.rows[0].n,
    upcomingConfirmed: upcomingRes.rows[0].n,
    statusBreakdown: statusRes.rows,
  };
}

async function getPatientStats(clinicId) {
  const [totalRes, genderRes] = await Promise.all([
    pool.query('SELECT COUNT(*)::int AS n FROM patients'),
    pool.query(
      `SELECT gender, COUNT(*)::int AS count FROM patients
       WHERE gender IS NOT NULL GROUP BY gender`
    ),
  ]);

  return {
    total: totalRes.rows[0].n,
    byGender: genderRes.rows,
  };
}

module.exports = { getQueueStats, getAppointmentStats, getPatientStats };
