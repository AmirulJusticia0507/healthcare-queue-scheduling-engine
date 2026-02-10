const pool = require('../../config/database');

async function getAllDoctors() {
  const res = await pool.query('SELECT * FROM doctors ORDER BY id ASC');
  return res.rows;
}

async function createDoctor(name, avgConsultTime) {
  const res = await pool.query(
    'INSERT INTO doctors(name, avg_consult_time) VALUES($1, $2) RETURNING *',
    [name, avgConsultTime]
  );
  return res.rows[0];
}

module.exports = {
  getAllDoctors,
  createDoctor,
};
