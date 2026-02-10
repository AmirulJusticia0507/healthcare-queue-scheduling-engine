const express = require('express');
const router = express.Router();
const doctorController = require('./doctor.controller');

router.get('/', doctorController.getDoctors);
router.post('/', doctorController.addDoctor);

module.exports = router;
