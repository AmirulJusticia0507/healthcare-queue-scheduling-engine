const pool = require('../../config/database');
const axios = require('axios');

const DNA_BASE = process.env.DNA_API_BASE || 'http://localhost:3000';

async function getDnaPatientByExternalId(externalId) {
  try {
    const endpoints = [
      { model: 'users', path: '/users' },
      { model: 'korban_bencana', path: '/korban-bencana' },
      { model: 'penyakit_genetik', path: '/penyakit-genetik' },
      { model: 'keturunan', path: '/keturunan' },
      { model: 'pasangan_hidup', path: '/pasangan-hidup' },
      { model: 'variant_assessments', path: '/variant-assessments' },
      { model: 'penelitian_ilmiah', path: '/penelitian-ilmiah' },
      { model: 'peningkatan_kinerja_atletik', path: '/peningkatan-kinerja-atletik' },
    ];

    for (const ep of endpoints) {
      try {
        const res = await axios.get(`${DNA_BASE}${ep.path}`, {
          params: { external_id: externalId },
          timeout: 5000,
        });
        if (res.data && (Array.isArray(res.data) ? res.data.length : res.data.id)) {
          return { source: ep.model, data: res.data };
        }
      } catch (e) {
        // continue to next endpoint
      }
    }
    return null;
  } catch (err) {
    console.error('DNA bridge error:', err.message);
    return null;
  }
}

module.exports = { getDnaPatientByExternalId };