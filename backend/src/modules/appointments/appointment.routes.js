const express = require('express');
const router = express.Router();
const appointmentController = require('./appointment.controller');
const { authorize } = require('../../middleware/role');

router.get('/', appointmentController.getAppointments);
router.get('/:id', appointmentController.getAppointmentById);
router.post('/', appointmentController.createAppointment);
router.patch('/:id/status', appointmentController.updateStatus);
router.patch('/:id/cancel', appointmentController.cancelAppointment);
router.patch('/:id/confirm-to-queue', appointmentController.confirmToQueue);
router.delete('/:id', authorize(['admin']), appointmentController.deleteAppointment);

module.exports = router;
