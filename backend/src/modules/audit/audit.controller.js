const auditService = require('./audit.service');

async function getAuditLogs(req, res) {
  try {
    const { page, limit, entityType, userId } = req.query;
    const data = await auditService.getAuditLogs({ page, limit, entityType, userId });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getAuditLogs };
