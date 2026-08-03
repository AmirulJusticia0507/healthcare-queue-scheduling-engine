const pool = require('../../config/database');
const { simulateQueue } = require('../../utils/queueEngine');

const STATUS_WAITING = 'waiting';
const STATUS_SKIPPED = 'skipped';

async function getWaitingQueue() {
  const res = await pool.query(
    'SELECT * FROM queue_entries WHERE status = $1 ORDER BY joined_at ASC, id ASC',
    [STATUS_WAITING]
  );
  return res.rows;
}

async function getDoctors() {
  const res = await pool.query('SELECT * FROM doctors ORDER BY id ASC');
  return res.rows;
}

async function persistDoctorAvailability(doctorStates) {
  for (const doctor of doctorStates) {
    await pool.query(
      'UPDATE doctors SET available_at = $1 WHERE id = $2',
      [new Date(doctor.availableAt).toISOString(), doctor.id]
    );
  }
}

/**
 * Hitung ulang jadwal seluruh antrian lalu simpan available_at dokter ke DB.
 * Dipanggil setiap kali antrian berubah (join/skip/recall) supaya estimasi
 * konsisten antar request.
 */
async function recalculateAvailability() {
  const [doctors, queue] = await Promise.all([getDoctors(), getWaitingQueue()]);
  const { doctorStates } = simulateQueue(doctors, queue);
  await persistDoctorAvailability(doctorStates);
}

/**
 * Ambil queue pasien waiting + estimatedTime + assignedDoctor.
 * Hanya simulasi dari available_at yang tersimpan di DB, tanpa menulis.
 */
async function getQueueEntries() {
  const [doctors, queue] = await Promise.all([getDoctors(), getWaitingQueue()]);
  const { updatedQueue } = simulateQueue(doctors, queue);
  return updatedQueue;
}

/**
 * Tambah pasien ke queue, lalu hitung ulang jadwal dokter.
 */
async function addQueueEntry(patientName) {
  const res = await pool.query(
    'INSERT INTO queue_entries(patient_name) VALUES($1) RETURNING *',
    [patientName]
  );
  await recalculateAvailability();
  return res.rows[0];
}

async function setPatientStatus(patientId, status) {
  const res = await pool.query(
    'UPDATE queue_entries SET status = $1 WHERE id = $2 RETURNING *',
    [status, patientId]
  );
  if (res.rows.length > 0) {
    await recalculateAvailability();
  }
  return res.rows[0];
}

/**
 * Skip pasien: status jadi 'skipped', slot dokter otomatis dibebaskan
 * lewat perhitungan ulang.
 */
async function skipPatient(patientId) {
  return setPatientStatus(patientId, STATUS_SKIPPED);
}

/**
 * Recall pasien yang dilewati: kembali ke status 'waiting'.
 */
async function recallPatient(patientId) {
  return setPatientStatus(patientId, STATUS_WAITING);
}

module.exports = {
  getQueueEntries,
  addQueueEntry,
  skipPatient,
  recallPatient,
};
