const pool = require('../../config/database');

async function getAllDoctors(clinicId) {
  if (clinicId) {
    const res = await pool.query(
      'SELECT * FROM doctors WHERE clinic_id = $1 ORDER BY id ASC',
      [clinicId]
    );
    return res.rows;
  }
  const res = await pool.query('SELECT * FROM doctors ORDER BY id ASC');
  return res.rows;
}

async function getDoctorById(id) {
  const res = await pool.query('SELECT * FROM doctors WHERE id = $1', [id]);
  return res.rows[0];
}

async function getDoctorByExternalId(externalId) {
  const res = await pool.query(
    'SELECT * FROM doctors WHERE external_id = $1',
    [externalId]
  );
  return res.rows[0];
}

async function createDoctor(name, avgConsultTime, clinicId, externalId = null) {
  const cid = clinicId || 1;
  const res = await pool.query(
    'INSERT INTO doctors(name, avg_consult_time, clinic_id, external_id) VALUES($1, $2, $3, $4) RETURNING *',
    [name, avgConsultTime, cid, externalId]
  );
  return res.rows[0];
}

module.exports = {
  getAllDoctors,
  getDoctorById,
  getDoctorByExternalId,
  createDoctor,
};
