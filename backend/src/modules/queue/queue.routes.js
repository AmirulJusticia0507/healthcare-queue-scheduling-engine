const express = require('express');
const router = express.Router();
const queueController = require('./queue.controller');

router.get('/', queueController.getQueue);
router.post('/', queueController.joinQueue);

module.exports = router;
