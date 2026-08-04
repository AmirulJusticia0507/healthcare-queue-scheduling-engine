const express = require('express');
const router = express.Router();
const queueController = require('./queue.controller');

router.get('/', queueController.getQueue);
router.post('/', queueController.joinQueue);
router.get('/history', queueController.getHistory);
router.get('/stream', queueController.stream);
router.patch('/:id/skip', queueController.skipPatient);
router.patch('/:id/recall', queueController.recallPatient);

module.exports = router;
