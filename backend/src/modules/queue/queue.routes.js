const express = require('express');
const router = express.Router();
const queueController = require('./queue.controller');

router.get('/', queueController.getQueue);
router.post('/', queueController.joinQueue);
router.get('/history', queueController.getHistory);
router.get('/history.csv', queueController.exportHistoryCsv);
router.get('/stream', queueController.stream);
router.patch('/:id/skip', queueController.skipPatient);
router.patch('/:id/recall', queueController.recallPatient);

// DNA Bridge endpoints
router.patch('/:id/external-id', queueController.setPatientExternalId);
router.patch('/:id/notes', queueController.setClinicalNotes);
router.get('/external/:externalId', queueController.getPatientByExternalId);
router.get('/:id', queueController.getPatient);

module.exports = router;
