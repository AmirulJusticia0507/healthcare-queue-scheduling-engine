const express = require('express');
const router = express.Router();
const notifController = require('./notification.controller');

router.get('/', notifController.getNotifications);
router.patch('/:id/read', notifController.markAsRead);
router.patch('/read-all', notifController.markAllAsRead);
router.delete('/:id', notifController.deleteNotification);

module.exports = router;
