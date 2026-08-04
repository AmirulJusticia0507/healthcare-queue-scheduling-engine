const express = require('express');
const app = express();

app.use(express.json());

// Global rate-limit untuk seluruh /api (longga). Login pakai limiter ketat terpisah.
const { apiRateLimit } = require('./middleware/rateLimit');
app.use('/api', apiRateLimit);

// Import routes + middleware
const authRoutes = require('./modules/auth/auth.routes');
const doctorRoutes = require('./modules/doctors/doctor.routes');
const queueRoutes = require('./modules/queue/queue.routes');
const { verifyToken } = require('./middleware/auth');
const { getCurrentPublic, streamPublic } = require('./modules/queue/queue.controller');

// Roteadder publik (tanpa auth) untuk TV/display
const publicRouter = express.Router();
publicRouter.get('/current', getCurrentPublic);
publicRouter.get('/public-stream', streamPublic);

// Public auth routes (login tidak butuh token)
app.use('/api/auth', authRoutes);

// Public queue endpoints untuk TV/display (harus didahului protected router)
app.use('/api/queue', publicRouter);

// Protected routes
app.use('/api/doctors', verifyToken, doctorRoutes);
app.use('/api/queue', verifyToken, queueRoutes);

module.exports = app;
