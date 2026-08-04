// Simple in-memory login rate limiter (per IP). For production use a shared
// store (e.g. Redis); sufficient for dev/demo.
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

const attempts = new Map();

function loginRateLimit(req, res, next) {
  const key = req.ip;
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || now - entry.start > WINDOW_MS) {
    attempts.set(key, { start: now, count: 1 });
    return next();
  }

  if (entry.count >= MAX_ATTEMPTS) {
    const retrySeconds = Math.max(0, Math.ceil((WINDOW_MS - (now - entry.start)) / 1000));
    return res.status(429).json({
      error: 'Too many login attempts, try again later',
      retrySeconds,
    });
  }

  entry.count += 1;
  next();
}

// Panggil ini di controller ketika login berhasil agar counter reset.
function resetLoginAttempts(key) {
  if (key) attempts.delete(key);
}

module.exports = { loginRateLimit, resetLoginAttempts };
