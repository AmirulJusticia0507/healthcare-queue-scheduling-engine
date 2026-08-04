const express = require('express');
const router = express.Router();
const queueController = require('./queue.controller');

// Protected routes (verifyToken applied at app.js level)
router.get('/', queueController.getQueue);
router.post('/', queueController.joinQueue);
router.get('/history', queueController.getHistory);
router.get('/history.csv', queueController.exportHistoryCsv);
router.get('/stream', queueController.stream);
router.patch('/:id/skip', queueController.skipPatient);
router.patch('/:id/recall', queueController.recallPatient);

module.exports = router;
