// Role-based authorization. `req.user` di-set oleh verifyToken (JWT).
// Contoh pemakaian: router.post('/', authorize(['admin']), handler)
function authorize(roles = []) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient role' });
    }
    next();
  };
}

module.exports = { authorize };
