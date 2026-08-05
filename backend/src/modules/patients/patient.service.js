const pool = require('../../config/database');

async function getAllPatients({ page = 1, limit = 20, q } = {}) {
  const where = [];
  const params = [];

  if (q) {
    params.push(`%${q}%`);
    where.push(`(name ILIKE $${params.length} OR email ILIKE $${params.length} OR medical_record_number ILIKE $${params.length} OR phone ILIKE $${params.length})`);
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = (Number(page) - 1) * Number(limit);

  const listRes = await pool.query(
    `SELECT * FROM patients ${whereClause} ORDER BY created_at DESC, id DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, Number(limit), offset]
  );

  const countRes = await pool.query(
    `SELECT COUNT(*)::int AS n FROM patients ${whereClause}`,
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

async function getPatientById(id) {
  const res = await pool.query('SELECT * FROM patients WHERE id = $1', [id]);
  return res.rows[0];
}

async function getPatientByExternalId(externalId) {
  const res = await pool.query('SELECT * FROM patients WHERE external_id = $1', [externalId]);
  return res.rows[0];
}

async function getPatientByMRN(mrn) {
  const res = await pool.query('SELECT * FROM patients WHERE medical_record_number = $1', [mrn]);
  return res.rows[0];
}

async function createPatient({ name, dateOfBirth, gender, phone, email, address, medicalRecordNumber, externalId }) {
  const res = await pool.query(
    `INSERT INTO patients(name, date_of_birth, gender, phone, email, address, medical_record_number, external_id)
     VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [name, dateOfBirth || null, gender || null, phone || null, email || null, address || null, medicalRecordNumber || null, externalId || null]
  );
  return res.rows[0];
}

async function updatePatient(id, data) {
  const fields = [];
  const params = [];
  const map = {
    name: 'name', dateOfBirth: 'date_of_birth', gender: 'gender',
    phone: 'phone', email: 'email', address: 'address',
    medicalRecordNumber: 'medical_record_number', externalId: 'external_id'
  };
  for (const [key, col] of Object.entries(map)) {
    if (data[key] !== undefined) {
      params.push(data[key]);
      fields.push(`${col} = $${params.length}`);
    }
  }
  if (fields.length === 0) return getPatientById(id);
  params.push(new Date().toISOString());
  fields.push(`updated_at = $${params.length}`);
  params.push(id);
  const res = await pool.query(`UPDATE patients SET ${fields.join(', ')} WHERE id = $${params.length} RETURNING *`, params);
  return res.rows[0];
}

async function deletePatient(id) {
  const res = await pool.query('DELETE FROM patients WHERE id = $1 RETURNING *', [id]);
  return res.rows[0];
}

async function getPatientQueueHistory(patientId) {
  const res = await pool.query(
    `SELECT q.*, d.name as doctor_name
     FROM queue_entries q
     LEFT JOIN doctors d ON q.doctor_id = d.id
     WHERE q.patient_id = $1
     ORDER BY q.created_at DESC`,
    [patientId]
  );
  return res.rows;
}

module.exports = {
  getAllPatients,
  getPatientById,
  getPatientByExternalId,
  getPatientByMRN,
  createPatient,
  updatePatient,
  deletePatient,
  getPatientQueueHistory,
};
