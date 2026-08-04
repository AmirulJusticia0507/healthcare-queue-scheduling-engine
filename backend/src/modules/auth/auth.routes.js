const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { verifyToken } = require('../../middleware/auth');
const { loginRateLimit } = require('../../middleware/rateLimit');

router.post('/login', loginRateLimit, authController.login);
router.get('/me', verifyToken, authController.whoami);

module.exports = router;
