const pool = require('../../config/database');
const logger = require('../../utils/logger');

/**
 * Archive queue entries older than retentionDays (default 90 days).
 * Moves them to archived_queue_entries and deletes from queue_entries.
 */
async function archiveOldEntries(retentionDays = 90) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - retentionDays);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Move old done/cancelled entries to archive
    const archived = await client.query(`
      INSERT INTO archived_queue_entries
        (id, patient_name, patient_id, patient_external_id, doctor_id, clinical_notes,
         status, joined_at, created_at, clinic_id, archived_at)
      SELECT id, patient_name, patient_id, patient_external_id, doctor_id, clinical_notes,
             status, joined_at, created_at, clinic_id, NOW()
      FROM queue_entries
      WHERE status IN ('done', 'cancelled')
        AND created_at < $1
      RETURNING id
    `, [cutoff.toISOString()]);

    if (archived.rows.length > 0) {
      const ids = archived.rows.map(r => r.id);
      await client.query(
        `DELETE FROM queue_entries WHERE id = ANY($1)`,
        [ids]
      );
    }

    await client.query('COMMIT');
    logger.info(`Archived ${archived.rows.length} old queue entries (>${retentionDays} days)`);
    return { archived: archived.rows.length };
  } catch (err) {
    await client.query('ROLLBACK');
    logger.error('Archive failed', { error: err.message });
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { archiveOldEntries };
