const dnaService = require('./dna.service');

async function getDnaPatient(req, res) {
  try {
    const { externalId } = req.params;
    if (!externalId) {
      return res.status(400).json({ error: 'externalId parameter required' });
    }

    const result = await dnaService.getDnaPatientByExternalId(externalId);
    if (!result) {
      return res.status(404).json({ error: 'Patient not found in DNA system' });
    }

    res.json({ externalId, ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getDnaPatient };