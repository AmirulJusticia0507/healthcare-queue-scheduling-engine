const auditService = require('./audit.service');

/**
 * Audit middleware — logs every write operation (POST, PUT, PATCH, DELETE).
 * Attach to specific routes or mount globally on /api.
 */
function auditMiddleware(req, res, next) {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const originalSend = res.send.bind(res);
    res.send = function (body) {
      // Fire-and-forget: don't block the response
      const userId = req.user?.sub || req.user?.id || null;
      const action = `${req.method} ${req.originalUrl}`;
      const entityType = extractEntityType(req.originalUrl);
      const entityId = req.params?.id || null;
      const details = req.method === 'DELETE'
        ? `Deleted by ${req.user?.email || 'system'}`
        : `${req.method} by ${req.user?.email || 'system'}`;

      auditService.log({
        userId,
        action,
        entityType,
        entityId,
        details,
        ipAddress: req.ip,
      }).catch(() => {});

      return originalSend(body);
    };
  }
  next();
}

function extractEntityType(url) {
  if (url.includes('/doctors')) return 'doctor';
  if (url.includes('/patients')) return 'patient';
  if (url.includes('/queue')) return 'queue_entry';
  if (url.includes('/appointments')) return 'appointment';
  if (url.includes('/users')) return 'user';
  return 'unknown';
}

module.exports = { auditMiddleware };
