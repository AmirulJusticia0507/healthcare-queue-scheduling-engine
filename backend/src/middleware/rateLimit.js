// In-memory rate limiter (per IP). Sufficient for dev/demo; use Redis in prod.

function rateLimit(max, windowMs) {
  const store = new Map();

  return function limiter(req, res, next) {
    const key = req.ip;
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || now - entry.start > windowMs) {
      store.set(key, { start: now, count: 1 });
      return next();
    }

    if (entry.count >= max) {
      const retrySeconds = Math.max(0, Math.ceil((windowMs - (now - entry.start)) / 1000));
      return res.status(429).json({
        error: 'Too many requests, try again later',
        retrySeconds,
      });
    }

    entry.count += 1;
    next();
  };
}

// Per-user rate limit (authenticated users)
function perUserRateLimit(max, windowMs) {
  const store = new Map();

  return function limiter(req, res, next) {
    const key = req.user?.sub || req.ip;
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || now - entry.start > windowMs) {
      store.set(key, { start: now, count: 1 });
      return next();
    }

    if (entry.count >= max) {
      const retrySeconds = Math.max(0, Math.ceil((windowMs - (now - entry.start)) / 1000));
      return res.status(429).json({
        error: 'Too many requests per user, try again later',
        retrySeconds,
      });
    }

    entry.count += 1;
    next();
  };
}

// --- Login limiter (ketat): 5 percobaan / 15 menit ---
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 5;
const loginAttempts = new Map();

function loginRateLimit(req, res, next) {
  const key = req.ip;
  const now = Date.now();
  const entry = loginAttempts.get(key);

  if (!entry || now - entry.start > LOGIN_WINDOW_MS) {
    loginAttempts.set(key, { start: now, count: 1 });
    return next();
  }

  if (entry.count >= LOGIN_MAX_ATTEMPTS) {
    const retrySeconds = Math.max(0, Math.ceil((LOGIN_WINDOW_MS - (now - entry.start)) / 1000));
    return res.status(429).json({
      error: 'Too many login attempts, try again later',
      retrySeconds,
    });
  }

  entry.count += 1;
  next();
}

function resetLoginAttempts(key) {
  if (key) loginAttempts.delete(key);
}

// Global limiter untuk seluruh /api (agak longgar): 120 req / menit per IP.
const apiRateLimit = rateLimit(120, 60 * 1000);

// Write operations: stricter per-user limit
const writeRateLimit = perUserRateLimit(30, 60 * 1000);

module.exports = { rateLimit, perUserRateLimit, loginRateLimit, resetLoginAttempts, apiRateLimit, writeRateLimit };
