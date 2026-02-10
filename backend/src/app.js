const express = require('express');
const app = express();

app.use(express.json());

// Import routes
const doctorRoutes = require('./modules/doctors/doctor.routes');
const queueRoutes = require('./modules/queue/queue.routes');

app.use('/api/doctors', doctorRoutes);
app.use('/api/queue', queueRoutes);

module.exports = app;
