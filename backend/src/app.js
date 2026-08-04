const express = require('express');
const app = express();

app.use(express.json());

// Global rate-limit untuk seluruh /api (longga). Login pakai limiter ketat terpisah.
const { apiRateLimit } = require('./middleware/rateLimit');
app.use('/api', apiRateLimit);

// Import routes + middleware
const authRoutes = require('./modules/auth/auth.routes');
const clinicRoutes = require('./modules/clinics/clinic.routes');
const doctorRoutes = require('./modules/doctors/doctor.routes');
const queueRoutes = require('./modules/queue/queue.routes');
const dnaRoutes = require('./modules/dna/dna.routes');
const { verifyToken } = require('./middleware/auth');
const { getCurrentPublic, streamPublic } = require('./modules/queue/queue.controller');
const doctorService = require('./modules/doctors/doctor.service');

// Router publik (tanpa auth) untuk TV/display
const publicRouter = express.Router();
publicRouter.get('/current', getCurrentPublic);
publicRouter.get('/public-stream', streamPublic);

// Daftar klinik (publik)
app.use('/api/clinics', clinicRoutes);

// Public auth routes (login tidak butuh token)
app.use('/api/auth', authRoutes);

// Public queue endpoints untuk TV/display
app.use('/api/queue', publicRouter);

// Public read-only doctor endpoints (untuk integrasi DNA system)
const publicDoctorRouter = express.Router();
publicDoctorRouter.get('/', async (req, res) => {
  try {
    const clinicId = Number(req.query.clinic) || null;
    const doctors = clinicId
      ? await doctorService.getAllDoctors(clinicId)
      : await doctorService.getAllDoctors();
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
publicDoctorRouter.get('/external/:externalId', async (req, res) => {
  try {
    const doctor = await doctorService.getDoctorByExternalId(req.params.externalId);
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
publicDoctorRouter.get('/:id', async (req, res) => {
  try {
    const doctor = await doctorService.getDoctorById(req.params.id);
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.use('/api/doctors', publicDoctorRouter);

// Protected routes (write operations)
app.use('/api/doctors', verifyToken, doctorRoutes);
app.use('/api/queue', verifyToken, queueRoutes);
app.use('/api/dna', verifyToken, dnaRoutes);

module.exports = app;
