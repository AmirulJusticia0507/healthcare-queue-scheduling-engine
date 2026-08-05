const express = require('express');
const router = express.Router();
const queueController = require('./queue.controller');
const { authorize } = require('../../middleware/role');

router.get('/', queueController.getQueue);
router.post('/', queueController.joinQueue);
router.get('/history', queueController.getHistory);
router.get('/history.csv', queueController.exportHistoryCsv);
router.get('/history.xlsx', queueController.exportHistoryExcel);
router.get('/stream', queueController.stream);
router.patch('/:id/skip', queueController.skipPatient);
router.patch('/:id/recall', queueController.recallPatient);

// DNA Bridge endpoints
router.patch('/:id/external-id', queueController.setPatientExternalId);
router.patch('/:id/notes', queueController.setClinicalNotes);
router.patch('/:id/assign-doctor', queueController.setDoctorId);
router.get('/external/:externalId', queueController.getPatientByExternalId);
router.get('/:id', queueController.getPatient);

// Bulk operations (admin only)
router.post('/bulk/assign-doctor', authorize(['admin']), queueController.bulkAssignDoctor);
router.post('/bulk/skip', authorize(['admin']), queueController.bulkSkip);
router.post('/bulk/delete', authorize(['admin']), queueController.bulkDelete);

module.exports = router;
