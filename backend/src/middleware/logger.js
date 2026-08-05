const logger = require('../utils/logger');

function requestLogger(req, res, next) {
  const start = Date.now();
  const { method, originalUrl, ip } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 400 ? 'warn' : 'info';
    logger.log(level, `${method} ${originalUrl}`, {
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip,
      userId: req.user?.sub || null,
    });
  });

  next();
}

module.exports = { requestLogger };
