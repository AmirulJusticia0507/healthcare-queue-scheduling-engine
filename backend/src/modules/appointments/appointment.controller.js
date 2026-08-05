const appointmentService = require('./appointment.service');
const { clinicOf } = require('../queue/queue.service');

async function getAppointments(req, res) {
  try {
    const { doctorId, date, status, page, limit } = req.query;
    const clinicId = clinicOf(req);
    const data = await appointmentService.getAppointments({ clinicId, doctorId, date, status, page, limit });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getAppointmentById(req, res) {
  try {
    const appt = await appointmentService.getAppointmentById(req.params.id);
    if (!appt) return res.status(404).json({ error: 'Appointment not found' });
    res.json(appt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function createAppointment(req, res) {
  try {
    const { patientId, doctorId, appointmentDate, appointmentTime, reason, notes } = req.body;
    if (!patientId || !doctorId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ error: 'patientId, doctorId, appointmentDate, appointmentTime are required' });
    }
    const clinicId = clinicOf(req);
    const appt = await appointmentService.createAppointment({
      patientId, doctorId, clinicId, appointmentDate, appointmentTime, reason, notes,
    });
    res.status(201).json(appt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateStatus(req, res) {
  try {
    const { status } = req.body;
    if (!['confirmed', 'completed', 'cancelled', 'no_show'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const appt = await appointmentService.updateAppointmentStatus(req.params.id, status);
    if (!appt) return res.status(404).json({ error: 'Appointment not found' });
    res.json(appt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function cancelAppointment(req, res) {
  try {
    const appt = await appointmentService.cancelAppointment(req.params.id);
    if (!appt) return res.status(404).json({ error: 'Appointment not found' });
    res.json(appt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteAppointment(req, res) {
  try {
    const appt = await appointmentService.deleteAppointment(req.params.id);
    if (!appt) return res.status(404).json({ error: 'Appointment not found' });
    res.json({ message: 'Appointment deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function confirmToQueue(req, res) {
  try {
    const entry = await appointmentService.createQueueEntryFromAppointment(req.params.id);
    if (!entry) return res.status(400).json({ error: 'Appointment not found or not confirmed' });
    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateStatus,
  cancelAppointment,
  deleteAppointment,
  confirmToQueue,
};
