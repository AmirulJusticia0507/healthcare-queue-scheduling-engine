const express = require('express');
const router = express.Router();
const dnaController = require('./dna.controller');

// DNA Bridge endpoints
router.get('/patient/:externalId', dnaController.getDnaPatient);

module.exports = router;