const pool = require('../../config/database');
const { simulateQueue } = require('../../utils/queueEngine');
const { publish } = require('../../utils/pubsub');

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

/**
 * Baseline: semua dokter dianggap free mulai sekarang.
 * available_at di DB hanya dipakai untuk tampilan, bukan sumber kebenaran
 * simulasi — sehingga hasil simulasi deterministik dan konsisten antar request.
 */
function getBaselineDoctors(doctors, now) {
  return doctors.map((d) => ({
    ...d,
    available_at: new Date(now).toISOString(),
  }));
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
 * Dipanggil setiap kali antrian berubah (join/skip/recall). Simulasi selalu
 * dimulai dari baseline "semua dokter free" supaya skip/recall otomatis
 * membebaskan slot dan hasilnya konsisten dengan GET.
 */
async function recalculateAvailability() {
  const [doctors, queue] = await Promise.all([getDoctors(), getWaitingQueue()]);
  const now = Date.now();
  const { doctorStates } = simulateQueue(getBaselineDoctors(doctors, now), queue, now);
  await persistDoctorAvailability(doctorStates);
}

/**
 * Ambil queue pasien waiting + estimatedTime + assignedDoctor.
 * Hanya simulasi (tanpa menulis), hasilnya sama dengan hitung ulang terakhir
 * selama antrian tidak berubah.
 */
async function getQueueEntries() {
  const [doctors, queue] = await Promise.all([getDoctors(), getWaitingQueue()]);
  const now = Date.now();
  const { updatedQueue } = simulateQueue(getBaselineDoctors(doctors, now), queue, now);
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
  publish('queue_update', { action: 'join' });
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
  const result = await setPatientStatus(patientId, STATUS_SKIPPED);
  if (result) publish('queue_update', { action: 'skip', id: patientId });
  return result;
}

/**
 * Recall pasien yang dilewati: kembali ke status 'waiting'.
 */
async function recallPatient(patientId) {
  const result = await setPatientStatus(patientId, STATUS_WAITING);
  publish('queue_update', { action: 'recall', id: patientId });
  return result;
}

/**
 * Riwayat semua entri antrian (waiting/skipped/called/done) beserta paginasi & filter.
 * query: { status?, page?, limit?, q? }  (q = filter nama pasien, case-insensitive)
 */
async function getHistory({ status, page = 1, limit = 20, q } = {}) {
  const where = [];
  const params = [];

  if (status) {
    params.push(status);
    where.push(`status = $${params.length}`);
  }
  if (q) {
    params.push(`%${q}%`);
    where.push(`patient_name ILIKE $${params.length}`);
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
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

module.exports = {
  getQueueEntries,
  getHistory,
  addQueueEntry,
  skipPatient,
  recallPatient,
};
