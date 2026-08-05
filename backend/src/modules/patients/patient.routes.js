const express = require('express');
const router = express.Router();
const patientController = require('./patient.controller');
const { authorize } = require('../../middleware/role');
const { findDuplicates, mergePatients } = require('./patientMerge.service');

router.get('/external/:externalId', patientController.getPatientByExternalId);
router.get('/search/duplicates', authorize(['admin']), async (req, res) => {
  try {
    const { name, phone, email, medicalRecordNumber } = req.query;
    const dupes = await findDuplicates({ name, phone, email, medicalRecordNumber });
    res.json(dupes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post('/merge', authorize(['admin']), async (req, res) => {
  try {
    const { primaryId, duplicateIds } = req.body;
    if (!primaryId || !Array.isArray(duplicateIds) || !duplicateIds.length) {
      return res.status(400).json({ error: 'primaryId and duplicateIds required' });
    }
    const merged = await mergePatients(primaryId, duplicateIds);
    res.json({ message: 'Merge successful', patient: merged });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get('/', patientController.getPatients);
router.get('/:id', patientController.getPatientById);
router.get('/:id/history', patientController.getPatientQueueHistory);
router.post('/', authorize(['admin', 'staff']), patientController.createPatient);
router.put('/:id', authorize(['admin', 'staff']), patientController.updatePatient);
router.delete('/:id', authorize(['admin']), patientController.deletePatient);

module.exports = router;
