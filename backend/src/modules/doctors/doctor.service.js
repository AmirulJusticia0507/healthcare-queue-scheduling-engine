const pool = require('../../config/database');

async function getAllDoctors(clinicId) {
  const cid = clinicId || 1;
  const res = await pool.query(
    'SELECT * FROM doctors WHERE clinic_id = $1 ORDER BY id ASC',
    [cid]
  );
  return res.rows;
}

async function createDoctor(name, avgConsultTime, clinicId) {
  const cid = clinicId || 1;
  const res = await pool.query(
    'INSERT INTO doctors(name, avg_consult_time, clinic_id) VALUES($1, $2, $3) RETURNING *',
    [name, avgConsultTime, cid]
  );
  return res.rows[0];
}

module.exports = {
  getAllDoctors,
  createDoctor,
};
