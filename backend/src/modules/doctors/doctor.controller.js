const doctorService = require('./doctor.service');

async function getDoctors(req, res) {
  try {
    const doctors = await doctorService.getAllDoctors();
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function addDoctor(req, res) {
  try {
    const { name, avgConsultTime } = req.body;
    const doctor = await doctorService.createDoctor(name, avgConsultTime);
    res.status(201).json(doctor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getDoctors,
  addDoctor,
};
