const authService = require('./auth.service');

async function login(req, res) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }
    const result = await authService.verifyUser(email, password);
    if (!result) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json({ user: result.user, token: result.token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function whoami(req, res) {
  const { id, name, email, role } = req.user;
  res.json({ user: { id, name, email, role } });
}

module.exports = { login, whoami };
