const pool = require('../../config/database');

async function findDuplicates({ name, phone, email, medicalRecordNumber } = {}) {
  const conditions = [];
  const params = [];

  if (name) {
    params.push(`%${name}%`);
    conditions.push(`name ILIKE $${params.length}`);
  }
  if (phone) {
    params.push(phone);
    conditions.push(`phone = $${params.length}`);
  }
  if (email) {
    params.push(email);
    conditions.push(`email = $${params.length}`);
  }
  if (medicalRecordNumber) {
    params.push(medicalRecordNumber);
    conditions.push(`medical_record_number = $${params.length}`);
  }

  if (conditions.length === 0) return [];

  const whereClause = `WHERE ${conditions.join(' OR ')}`;
  const res = await pool.query(
    `SELECT * FROM patients ${whereClause} ORDER BY created_at ASC`,
    params
  );
  return res.rows;
}

async function mergePatients(primaryId, duplicateIds) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get primary patient
    const primary = await client.query('SELECT * FROM patients WHERE id = $1', [primaryId]);
    if (primary.rows.length === 0) throw new Error('Primary patient not found');
    const p = primary.rows[0];

    // Update primary with any missing fields from duplicates
    for (const dupId of duplicateIds) {
      const dup = await client.query('SELECT * FROM patients WHERE id = $1', [dupId]);
      if (dup.rows.length === 0) continue;
      const d = dup.rows[0];

      const updates = [];
      const vals = [];
      let idx = 1;

      if (!p.phone && d.phone) { updates.push(`phone = $${idx++}`); vals.push(d.phone); }
      if (!p.email && d.email) { updates.push(`email = $${idx++}`); vals.push(d.email); }
      if (!p.address && d.address) { updates.push(`address = $${idx++}`); vals.push(d.address); }
      if (!p.date_of_birth && d.date_of_birth) { updates.push(`date_of_birth = $${idx++}`); vals.push(d.date_of_birth); }
      if (!p.gender && d.gender) { updates.push(`gender = $${idx++}`); vals.push(d.gender); }
      if (!p.external_id && d.external_id) { updates.push(`external_id = $${idx++}`); vals.push(d.external_id); }

      if (updates.length > 0) {
        vals.push(primaryId);
        await client.query(`UPDATE patients SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${idx}`, vals);
      }

      // Re-point queue_entries and appointments to primary
      await client.query('UPDATE queue_entries SET patient_id = $1 WHERE patient_id = $2', [primaryId, dupId]);
      await client.query('UPDATE appointments SET patient_id = $1 WHERE patient_id = $2', [primaryId, dupId]);

      // Delete duplicate
      await client.query('DELETE FROM patients WHERE id = $1', [dupId]);
    }

    await client.query('COMMIT');
    const updated = await client.query('SELECT * FROM patients WHERE id = $1', [primaryId]);
    return updated.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { findDuplicates, mergePatients };
