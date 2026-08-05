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

async function getDoctorByExternalId(req, res) {
  try {
    const doctor = await doctorService.getDoctorByExternalId(req.params.externalId);
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function addDoctor(req, res) {
  try {
    const { name, avgConsultTime, clinic_id, external_id } = req.body;
    const clinicId = Number(clinic_id) || Number(req.query.clinic) || 1;
    const doctor = await doctorService.createDoctor(name, avgConsultTime, clinicId, external_id || null);
    res.status(201).json(doctor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateDoctor(req, res) {
  try {
    const doctor = await doctorService.updateDoctor(req.params.id, req.body);
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteDoctor(req, res) {
  try {
    const doctor = await doctorService.deleteDoctor(req.params.id);
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
    res.json({ message: 'Doctor deleted', doctor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getDoctors,
  getDoctorByExternalId,
  addDoctor,
  updateDoctor,
  deleteDoctor,
};
