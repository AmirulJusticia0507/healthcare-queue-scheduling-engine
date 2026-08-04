const pool = require('../../config/database');
const { simulateQueue } = require('../../utils/queueEngine');
const { publish } = require('../../utils/pubsub');

const STATUS_WAITING = 'waiting';
const STATUS_SKIPPED = 'skipped';
const DEFAULT_CLINIC = 1;

function clinicOf(req) {
  const c = Number(req?.query?.clinic || req?.body?.clinic_id || DEFAULT_CLINIC);
  return Number.isNaN(c) || c < 1 ? DEFAULT_CLINIC : c;
}

async function getDoctorsByClinic(clinicId) {
  const res = await pool.query(
    'SELECT * FROM doctors WHERE clinic_id = $1 ORDER BY id ASC',
    [clinicId]
  );
  return res.rows;
}

/**
 * Baseline: semua dokter di klinik ini dianggap free mulai sekarang.
 */
function getBaselineDoctors(doctors, now) {
  return doctors.map((d) => ({
    ...d,
    available_at: new Date(now).toISOString(),
  }));
}

async function persistDoctorAvailability(clinicId, doctorStates) {
  for (const doctor of doctorStates) {
    await pool.query(
      'UPDATE doctors SET available_at = $1 WHERE id = $2 AND clinic_id = $3',
      [new Date(doctor.availableAt).toISOString(), doctor.id, clinicId]
    );
  }
}

async function recalculateAvailability(clinicId) {
  const [doctors, queue] = await Promise.all([getDoctorsByClinic(clinicId), getWaitingQueue(clinicId)]);
  const now = Date.now();
  const { updatedQueue, doctorStates } = simulateQueue(getBaselineDoctors(doctors, now), queue, now);
  await persistDoctorAvailability(clinicId, doctorStates);
  // persist doctor_id assignment for each waiting patient
  for (const patient of updatedQueue) {
    if (patient.assignedDoctor && patient.assignedDoctor.doctor_id) {
      await pool.query(
        'UPDATE queue_entries SET doctor_id = $1 WHERE id = $2',
        [patient.assignedDoctor.doctor_id, patient.id]
      );
    }
  }
}

/**
 * Ambil queue pasien waiting + estimatedTime + assignedDoctor.
 */
async function getQueueEntries(clinicId) {
  clinicId = clinicId || DEFAULT_CLINIC;
  const [doctors, queue] = await Promise.all([getDoctorsByClinic(clinicId), getWaitingQueue(clinicId)]);
  const now = Date.now();
  const { updatedQueue } = simulateQueue(getBaselineDoctors(doctors, now), queue, now);
  return updatedQueue;
}

async function getWaitingQueue(clinicId) {
  const res = await pool.query(
    'SELECT * FROM queue_entries WHERE status = $1 AND clinic_id = $2 ORDER BY joined_at ASC, id ASC',
    [STATUS_WAITING, clinicId]
  );
  return res.rows;
}

async function addQueueEntry(patientName, clinicId, patient_external_id = null) {
  clinicId = clinicId || DEFAULT_CLINIC;
  const res = await pool.query(
    'INSERT INTO queue_entries(patient_name, clinic_id, patient_external_id) VALUES($1, $2, $3) RETURNING *',
    [patientName, clinicId, patient_external_id]
  );
  await recalculateAvailability(clinicId);
  publish('queue_update', { action: 'join', clinicId });
  return res.rows[0];
}

async function setPatientStatus(patientId, status) {
  const res = await pool.query(
    'UPDATE queue_entries SET status = $1 WHERE id = $2 RETURNING *',
    [status, patientId]
  );
  if (res.rows.length > 0) {
    await recalculateAvailability(res.rows[0].clinic_id);
  }
  return res.rows[0];
}

async function skipPatient(patientId) {
  const result = await setPatientStatus(patientId, STATUS_SKIPPED);
  if (result) publish('queue_update', { action: 'skip', id: patientId, clinicId: result.clinic_id });
  return result;
}

async function recallPatient(patientId) {
  const result = await setPatientStatus(patientId, STATUS_WAITING);
  publish('queue_update', { action: 'recall', id: patientId });
  return result;
}

async function setPatientExternalId(patientId, externalId) {
  const res = await pool.query(
    'UPDATE queue_entries SET patient_external_id = $1 WHERE id = $2 RETURNING *',
    [externalId, patientId]
  );
  if (res.rows.length > 0) {
    publish('queue_update', { action: 'update_external_id', id: patientId, externalId });
  }
  return res.rows[0];
}

async function setClinicalNotes(patientId, notes) {
  const res = await pool.query(
    'UPDATE queue_entries SET clinical_notes = $1 WHERE id = $2 RETURNING *',
    [notes, patientId]
  );
  if (res.rows.length > 0) {
    publish('queue_update', { action: 'update_notes', id: patientId });
  }
  return res.rows[0];
}

async function getPatientByExternalId(externalId, clinicId = DEFAULT_CLINIC) {
  const res = await pool.query(
    'SELECT * FROM queue_entries WHERE patient_external_id = $1 AND clinic_id = $2',
    [externalId, clinicId]
  );
  return res.rows[0];
}

async function getPatient(id) {
  const res = await pool.query('SELECT * FROM queue_entries WHERE id = $1', [id]);
  return res.rows[0];
}

async function setDoctorId(patientId, doctorId) {
  const res = await pool.query(
    'UPDATE queue_entries SET doctor_id = $1 WHERE id = $2 RETURNING *',
    [doctorId, patientId]
  );
  if (res.rows.length > 0) {
    publish('queue_update', { action: 'assign_doctor', id: patientId, doctorId });
  }
  return res.rows[0];
}

/**
 * Riwayat semua entri antrian (waiting/skipped/called/done) beserta paginasi & filter.
 * query: { status?, page?, limit?, q? }  (q = filter nama pasien, case-insensitive)
 */
async function getHistory({ clinicId, status, page = 1, limit = 20, q } = {}) {
  clinicId = clinicId || DEFAULT_CLINIC;
  const where = ['clinic_id = $1'];
  const params = [clinicId];

  if (status) {
    params.push(status);
    where.push(`status = $${params.length}`);
  }
  if (q) {
    params.push(`%${q}%`);
    where.push(`patient_name ILIKE $${params.length}`);
  }

  const whereClause = `WHERE ${where.join(' AND ')}`;
  const offset = (Number(page) - 1) * Number(limit);

  const listRes = await pool.query(
    `SELECT * FROM queue_entries ${whereClause} ORDER BY created_at DESC, id DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, Number(limit), offset]
  );

  const countRes = await pool.query(
    `SELECT COUNT(*)::int AS n FROM queue_entries ${whereClause}`,
    params
  );

  const total = Number(countRes.rows[0].n);
  const totalPages = Math.ceil(total / Number(limit)) || 1;
  return {
    items: listRes.rows,
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages,
  };
}

async function getHistoryCsv({ clinicId, status, q } = {}) {
  clinicId = clinicId || DEFAULT_CLINIC;
  const where = ['clinic_id = $1'];
  const params = [clinicId];
  if (status) {
    params.push(status);
    where.push(`status = $${params.length}`);
  }
  if (q) {
    params.push(`%${q}%`);
    where.push(`patient_name ILIKE $${params.length}`);
  }
  const whereClause = `WHERE ${where.join(' AND ')}`;

  const res = await pool.query(
    `SELECT id, patient_name, status, joined_at, created_at FROM queue_entries ${whereClause} ORDER BY created_at ASC, id ASC`,
    params
  );

  const esc = (v) => {
    const s = v == null ? '' : String(v);
    return `"${s.replace(/"/g, '""')}"`;
  };
  let csv = 'id,patient_name,status,joined_at,created_at';
  for (const r of res.rows) {
    csv += `\n${esc(r.id)},${esc(r.patient_name)},${esc(r.status)},${esc(r.joined_at)},${esc(r.created_at)}`;
  }
  return csv;
}

module.exports = {
  getQueueEntries,
  getWaitingQueue,
  getCurrentPublic: getQueueEntries,
  getHistory,
  getHistoryCsv,
  addQueueEntry,
  skipPatient,
  recallPatient,
  setPatientExternalId,
  setClinicalNotes,
  setDoctorId,
  getPatientByExternalId,
  getPatient,
  clinicOf,
  DEFAULT_CLINIC,
};
