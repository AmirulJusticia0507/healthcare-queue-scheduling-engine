const express = require('express');
const router = express.Router();
const reportController = require('./report.controller');

router.get('/dashboard', reportController.getDashboardStats);

module.exports = router;
