const express = require('express');
const cors = require('cors');
const app = express();
const { requestLogger } = require('./middleware/logger');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../config/swagger');

// CORS hardening
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:5174,http://localhost:3000').split(',');
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
}));

app.use(express.json({ limit: '1mb' }));
app.use(requestLogger);

// Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customSiteTitle: 'Healthcare Queue API Docs',
}));

// Health check
app.get('/health', async (req, res) => {
  try {
    const pool = require('./config/database');
    await pool.query('SELECT 1');
    res.json({ status: 'ok', service: 'healthcare-backend', db: 'connected', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({ status: 'error', service: 'healthcare-backend', db: 'disconnected', error: err.message });
  }
});

// Global rate-limit untuk seluruh /api (longga). Login pakai limiter ketat terpisah.
const { apiRateLimit } = require('./middleware/rateLimit');
app.use('/api', apiRateLimit);

// Audit middleware — logs all write operations
const { auditMiddleware } = require('./middleware/audit');
app.use('/api', auditMiddleware);

// Import routes + middleware
const authRoutes = require('./modules/auth/auth.routes');
const clinicRoutes = require('./modules/clinics/clinic.routes');
const doctorRoutes = require('./modules/doctors/doctor.routes');
const patientRoutes = require('./modules/patients/patient.routes');
const queueRoutes = require('./modules/queue/queue.routes');
const dnaRoutes = require('./modules/dna/dna.routes');
const auditRoutes = require('./modules/audit/audit.routes');
const notifRoutes = require('./modules/notifications/notification.routes');
const appointmentRoutes = require('./modules/appointments/appointment.routes');
const reportRoutes = require('./modules/reports/report.routes');
const webhookRoutes = require('./modules/webhooks/webhook.routes');
const { verifyToken } = require('./middleware/auth');
const { getCurrentPublic, streamPublic } = require('./modules/queue/queue.controller');
const doctorService = require('./modules/doctors/doctor.service');
const queueService = require('./modules/queue/queue.service');
const { validateIntegrationKey } = require('./middleware/integration');

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

// Patient self-registration (public)
const patientService = require('./modules/patients/patient.service');
app.post('/api/register', async (req, res) => {
  try {
    const { name, dateOfBirth, gender, phone, email, address, medicalRecordNumber } = req.body;
    if (!name) return res.status(400).json({ error: 'Nama wajib diisi' });
    const patient = await patientService.createPatient({
      name, dateOfBirth, gender, phone, email, address, medicalRecordNumber,
    });
    res.status(201).json({ message: 'Registrasi berhasil', patient });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Nomor rekam medis sudah terdaftar' });
    }
    res.status(500).json({ error: err.message });
  }
});

// === PUBLIC INTEGRATION ROUTES (untuk DNA system, butuh API key) ===

// List all doctors
app.get('/api/doctors', validateIntegrationKey, async (req, res) => {
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

// Get doctor by external_id
app.get('/api/doctors/external/:externalId', validateIntegrationKey, async (req, res) => {
  try {
    const doctor = await doctorService.getDoctorByExternalId(req.params.externalId);
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get doctor by ID
app.get('/api/doctors/:id', validateIntegrationKey, async (req, res) => {
  try {
    const doctor = await doctorService.getDoctorById(req.params.id);
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Find queue entry by patient external_id
app.get('/api/doctors/queue/external/:externalId', validateIntegrationKey, async (req, res) => {
  try {
    const entry = await queueService.getPatientByExternalId(req.params.externalId);
    if (!entry) return res.status(404).json({ error: 'Queue entry not found for this patient' });
    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Assign doctor to queue entry (for DNA system integration)
app.patch('/api/doctors/assign/:patientId', validateIntegrationKey, async (req, res) => {
  try {
    const { doctorId } = req.body;
    if (!doctorId) return res.status(400).json({ error: 'doctorId required' });
    const entry = await queueService.setDoctorId(req.params.patientId, doctorId);
    if (!entry) return res.status(404).json({ error: 'Patient not found' });
    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lab results push from testDNA → clinical_notes (integration key)
app.patch('/api/queue/:id/clinical-notes', validateIntegrationKey, async (req, res) => {
  try {
    const { notes } = req.body;
    const entry = await queueService.setClinicalNotes(req.params.id, notes || '');
    if (!entry) return res.status(404).json({ error: 'Queue entry not found' });
    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Doctor schedule sync endpoint (for testDNA integration)
app.get('/api/doctors/:id/schedule', validateIntegrationKey, async (req, res) => {
  try {
    const doctor = await doctorService.getDoctorById(req.params.id);
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
    res.json({
      doctor,
      available_at: doctor.available_at,
      avg_consult_time: doctor.avg_consult_time,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === PROTECTED ROUTES (require JWT) ===

// Protected doctor routes (write: create)
app.use('/api/doctors', verifyToken, doctorRoutes);
app.use('/api/patients', verifyToken, patientRoutes);
app.use('/api/queue', verifyToken, queueRoutes);
app.use('/api/dna', verifyToken, dnaRoutes);
app.use('/api/audit', verifyToken, auditRoutes);
app.use('/api/notifications', verifyToken, notifRoutes);
app.use('/api/appointments', verifyToken, appointmentRoutes);
app.use('/api/reports', verifyToken, reportRoutes);
app.use('/api/webhooks', verifyToken, webhookRoutes);

module.exports = app;
