const patientService = require('./patient.service');

async function getPatients(req, res) {
  try {
    const { page, limit, q } = req.query;
    const data = await patientService.getAllPatients({ page, limit, q });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getPatientById(req, res) {
  try {
    const patient = await patientService.getPatientById(req.params.id);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getPatientByExternalId(req, res) {
  try {
    const patient = await patientService.getPatientByExternalId(req.params.externalId);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function createPatient(req, res) {
  try {
    const { name, dateOfBirth, gender, phone, email, address, medicalRecordNumber, externalId } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const patient = await patientService.createPatient({ name, dateOfBirth, gender, phone, email, address, medicalRecordNumber, externalId });
    res.status(201).json(patient);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Medical record number already exists' });
    res.status(500).json({ error: err.message });
  }
}

async function updatePatient(req, res) {
  try {
    const patient = await patientService.updatePatient(req.params.id, req.body);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deletePatient(req, res) {
  try {
    const patient = await patientService.deletePatient(req.params.id);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json({ message: 'Patient deleted', patient });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getPatientQueueHistory(req, res) {
  try {
    const history = await patientService.getPatientQueueHistory(req.params.id);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getPatients,
  getPatientById,
  getPatientByExternalId,
  createPatient,
  updatePatient,
  deletePatient,
  getPatientQueueHistory,
};
