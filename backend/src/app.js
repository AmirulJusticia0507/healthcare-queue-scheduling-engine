const express = require('express');
const app = express();

app.use(express.json());

// Import routes
const authRoutes = require('./modules/auth/auth.routes');
const doctorRoutes = require('./modules/doctors/doctor.routes');
const queueRoutes = require('./modules/queue/queue.routes');
const { verifyToken } = require('./middleware/auth');

// Public auth routes (login does not require a token)
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/doctors', verifyToken, doctorRoutes);
app.use('/api/queue', verifyToken, queueRoutes);

module.exports = app;
