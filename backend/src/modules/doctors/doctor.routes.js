const express = require('express');
const router = express.Router();
const doctorController = require('./doctor.controller');
const { authorize } = require('../../middleware/role');

router.get('/external/:externalId', doctorController.getDoctorByExternalId);
router.get('/', doctorController.getDoctors);
router.post('/', authorize(['admin']), doctorController.addDoctor);
router.put('/:id', authorize(['admin']), doctorController.updateDoctor);
router.delete('/:id', authorize(['admin']), doctorController.deleteDoctor);

module.exports = router;
