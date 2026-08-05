const express = require('express');
const router = express.Router();
const patientController = require('./patient.controller');
const { authorize } = require('../../middleware/role');

router.get('/external/:externalId', patientController.getPatientByExternalId);
router.get('/', patientController.getPatients);
router.get('/:id', patientController.getPatientById);
router.get('/:id/history', patientController.getPatientQueueHistory);
router.post('/', authorize(['admin', 'staff']), patientController.createPatient);
router.put('/:id', authorize(['admin', 'staff']), patientController.updatePatient);
router.delete('/:id', authorize(['admin']), patientController.deletePatient);

module.exports = router;
