const authService = require('./auth.service');
const { resetLoginAttempts } = require('../../middleware/rateLimit');

async function login(req, res) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }
    const result = await authService.verifyUser(email, password);
    if (!result) {
      await authService.logLogin({ email, ipAddress: req.ip, success: false, userAgent: req.headers['user-agent'] });
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    resetLoginAttempts(req.ip);
    await authService.logLogin({ userId: result.user.id, email, ipAddress: req.ip, success: true, userAgent: req.headers['user-agent'] });
    res.json({ user: result.user, token: result.token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function whoami(req, res) {
  const { id, name, email, role } = req.user;
  res.json({ user: { id, name, email, role } });
}

async function getAllUsers(req, res) {
  try {
    const users = await authService.getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getUserById(req, res) {
  try {
    const user = await authService.getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function createUser(req, res) {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'name, email, password are required' });
    const existing = await authService.getUserByEmail(email);
    if (existing) return res.status(409).json({ error: 'Email sudah terdaftar' });
    const user = await authService.createUser({ name, email, password, role });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateUser(req, res) {
  try {
    const { name, email, role, doctorId } = req.body;
    const user = await authService.updateUser(req.params.id, { name, email, role, doctorId });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function resetPassword(req, res) {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) return res.status(400).json({ error: 'Password minimal 6 karakter' });
    const user = await authService.resetPassword(req.params.id, newPassword);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'Password berhasil direset', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'currentPassword dan newPassword required' });
    if (newPassword.length < 6) return res.status(400).json({ error: 'Password baru minimal 6 karakter' });
    await authService.changePassword(req.user.sub, currentPassword, newPassword);
    res.json({ message: 'Password berhasil diubah' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function updateProfile(req, res) {
  try {
    const { name, email } = req.body;
    const user = await authService.updateUser(req.user.sub, { name, email });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteUser(req, res) {
  try {
    const user = await authService.deleteUser(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User berhasil dihapus', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getLoginLogs(req, res) {
  try {
    const { page, limit, userId } = req.query;
    const data = await authService.getLoginLogs({ page, limit, userId });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  login, whoami, getAllUsers, getUserById, createUser,
  updateUser, resetPassword, changePassword, updateProfile,
  deleteUser, getLoginLogs,
};
