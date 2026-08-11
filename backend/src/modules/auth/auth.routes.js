const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { verifyToken } = require('../../middleware/auth');
const { authorize } = require('../../middleware/role');
const { loginRateLimit } = require('../../middleware/rateLimit');
const { verifyCaptcha } = require('../../middleware/captcha');

// Public
router.post('/login', loginRateLimit, verifyCaptcha, authController.login);

// Authenticated (any role)
router.get('/me', verifyToken, authController.whoami);
router.patch('/profile', verifyToken, authController.updateProfile);
router.post('/change-password', verifyToken, authController.changePassword);

// Admin only — user management
router.get('/users', verifyToken, authorize(['admin']), authController.getAllUsers);
router.get('/users/:id', verifyToken, authorize(['admin']), authController.getUserById);
router.post('/users', verifyToken, authorize(['admin']), authController.createUser);
router.put('/users/:id', verifyToken, authorize(['admin']), authController.updateUser);
router.post('/users/:id/reset-password', verifyToken, authorize(['admin']), authController.resetPassword);
router.delete('/users/:id', verifyToken, authorize(['admin']), authController.deleteUser);

// Admin only — login logs
router.get('/login-logs', verifyToken, authorize(['admin']), authController.getLoginLogs);

module.exports = router;
