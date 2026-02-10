const pool = require('../../config/database');

/**
 * Ambil semua pasien yang status = waiting
 * dan hitung assignedDoctor + estimatedTime
 */
async function getQueueEntries() {
  const doctorsRes = await pool.query('SELECT * FROM doctors ORDER BY id ASC');
  let doctors = doctorsRes.rows.map(d => ({
    ...d,
    availableAt: Date.now() // semua dokter free sekarang
  }));

  const queueRes = await pool.query(
    'SELECT * FROM queue_entries WHERE status = $1 ORDER BY joined_at ASC',
    ['waiting']
  );
  const queue = queueRes.rows;

  const updatedQueue = queue.map(patient => {
    // pilih doctor yang free paling cepat
    doctors.sort((a, b) => a.availableAt - b.availableAt);
    const assignedDoctor = doctors[0];

    const estimatedTime = Math.max(
      0,
      Math.ceil((assignedDoctor.availableAt - Date.now()) / 60000)
    );

    // update availableAt dokter
    assignedDoctor.availableAt += assignedDoctor.avg_consult_time * 60000;

    return {
      ...patient,
      estimatedTime,
      assignedDoctor: {
        id: assignedDoctor.id,
        name: assignedDoctor.name,
        availableAt: assignedDoctor.availableAt
      }
    };
  });

  return updatedQueue;
}

/**
 * Tambah pasien ke queue
 */
async function addQueueEntry(patientName) {
  const res = await pool.query(
    'INSERT INTO queue_entries(patient_name) VALUES($1) RETURNING *',
    [patientName]
  );
  return res.rows[0];
}

/**
 * Skip pasien sementara
 */
async function skipPatient(patientId) {
  const res = await pool.query(
    'UPDATE queue_entries SET status = $1 WHERE id = $2 RETURNING *',
    ['skipped', patientId]
  );
  return res.rows[0];
}

/**
 * Recall pasien yang dilewati
 */
async function recallPatient(patientId) {
  const res = await pool.query(
    'UPDATE queue_entries SET status = $1 WHERE id = $2 RETURNING *',
    ['waiting', patientId]
  );
  return res.rows[0];
}

module.exports = {
  getQueueEntries,
  addQueueEntry,
  skipPatient,
  recallPatient
};
