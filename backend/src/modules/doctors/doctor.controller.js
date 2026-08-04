const doctorService = require('./doctor.service');

async function getDoctors(req, res) {
  try {
    const clinicId = Number(req.query.clinic) || 1;
    const doctors = await doctorService.getAllDoctors(clinicId);
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function addDoctor(req, res) {
  try {
    const { name, avgConsultTime, clinic_id } = req.body;
    const clinicId = Number(clinic_id) || Number(req.query.clinic) || 1;
    const doctor = await doctorService.createDoctor(name, avgConsultTime, clinicId);
    res.status(201).json(doctor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getDoctors,
  addDoctor,
};
