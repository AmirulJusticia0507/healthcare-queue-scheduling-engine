const pool = require('../../config/database');

async function getAppointments({ clinicId, doctorId, date, status, page = 1, limit = 20 } = {}) {
  const where = [];
  const params = [];

  if (clinicId) {
    params.push(clinicId);
    where.push(`a.clinic_id = $${params.length}`);
  }
  if (doctorId) {
    params.push(doctorId);
    where.push(`a.doctor_id = $${params.length}`);
  }
  if (date) {
    params.push(date);
    where.push(`a.appointment_date = $${params.length}`);
  }
  if (status) {
    params.push(status);
    where.push(`a.status = $${params.length}`);
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = (Number(page) - 1) * Number(limit);

  const listRes = await pool.query(
    `SELECT a.*, d.name AS doctor_name, p.name AS patient_name, p.phone AS patient_phone, p.email AS patient_email
     FROM appointments a
     LEFT JOIN doctors d ON a.doctor_id = d.id
     LEFT JOIN patients p ON a.patient_id = p.id
     ${whereClause}
     ORDER BY a.appointment_date ASC, a.appointment_time ASC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, Number(limit), offset]
  );

  const countRes = await pool.query(
    `SELECT COUNT(*)::int AS n FROM appointments a ${whereClause}`,
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

async function getAppointmentById(id) {
  const res = await pool.query(
    `SELECT a.*, d.name AS doctor_name, p.name AS patient_name, p.phone AS patient_phone
     FROM appointments a
     LEFT JOIN doctors d ON a.doctor_id = d.id
     LEFT JOIN patients p ON a.patient_id = p.id
     WHERE a.id = $1`,
    [id]
  );
  return res.rows[0];
}

async function createAppointment({ patientId, doctorId, clinicId, appointmentDate, appointmentTime, reason, notes }) {
  const res = await pool.query(
    `INSERT INTO appointments(patient_id, doctor_id, clinic_id, appointment_date, appointment_time, reason, notes)
     VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [patientId, doctorId, clinicId, appointmentDate, appointmentTime, reason || null, notes || null]
  );
  return res.rows[0];
}

async function updateAppointmentStatus(id, status) {
  const res = await pool.query(
    'UPDATE appointments SET status = $1 WHERE id = $2 RETURNING *',
    [status, id]
  );
  return res.rows[0];
}

async function cancelAppointment(id) {
  const res = await pool.query(
    "UPDATE appointments SET status = 'cancelled' WHERE id = $2 RETURNING *",
    ['cancelled', id]
  );
  return res.rows[0];
}

async function deleteAppointment(id) {
  const res = await pool.query('DELETE FROM appointments WHERE id = $1 RETURNING *', [id]);
  return res.rows[0];
}

async function createQueueEntryFromAppointment(appointmentId) {
  const appt = await getAppointmentById(appointmentId);
  if (!appt || appt.status !== 'confirmed') return null;

  const pool2 = require('../../config/database');
  const queueRes = await pool2.query(
    `INSERT INTO queue_entries(patient_name, patient_id, clinic_id, patient_external_id)
     SELECT p.name, p.id, a.clinic_id, p.external_id
     FROM appointments a
     JOIN patients p ON a.patient_id = p.id
     WHERE a.id = $1
     RETURNING *`,
    [appointmentId]
  );

  await updateAppointmentStatus(appointmentId, 'completed');
  return queueRes.rows[0];
}

module.exports = {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointmentStatus,
  cancelAppointment,
  deleteAppointment,
  createQueueEntryFromAppointment,
};
