const express = require('express');
const router = express.Router();
const auditController = require('./audit.controller');
const { authorize } = require('../../middleware/role');

router.get('/', authorize(['admin']), auditController.getAuditLogs);

module.exports = router;
