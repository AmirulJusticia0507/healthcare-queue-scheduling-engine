const express = require('express');
const router = express.Router();
const pool = require('../../config/database');

// Public: daftar klinik untuk switcher (mounted di /api/clinics)
router.get('/', async (req, res) => {
  try {
    const r = await pool.query('SELECT id, name, code FROM clinics ORDER BY id ASC');
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
