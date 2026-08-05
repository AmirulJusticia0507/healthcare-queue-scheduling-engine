const reportService = require('./report.service');
const { clinicOf } = require('../queue/queue.service');

async function getDashboardStats(req, res) {
  try {
    const clinicId = clinicOf(req);
    const [queue, appointments, patients] = await Promise.all([
      reportService.getQueueStats(clinicId),
      reportService.getAppointmentStats(clinicId),
      reportService.getPatientStats(),
    ]);
    res.json({ queue, appointments, patients });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getDashboardStats };
