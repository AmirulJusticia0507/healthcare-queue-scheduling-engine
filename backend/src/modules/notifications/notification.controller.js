const notifService = require('./notification.service');

async function getNotifications(req, res) {
  try {
    const { page, limit, unreadOnly } = req.query;
    const data = await notifService.getNotifications(req.user.sub, {
      page, limit, unreadOnly: unreadOnly === 'true',
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function markAsRead(req, res) {
  try {
    const notif = await notifService.markAsRead(req.params.id, req.user.sub);
    if (!notif) return res.status(404).json({ error: 'Notifikasi tidak ditemukan' });
    res.json(notif);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function markAllAsRead(req, res) {
  try {
    await notifService.markAllAsRead(req.user.sub);
    res.json({ message: 'Semua notifikasi ditandai sudah dibaca' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteNotification(req, res) {
  try {
    const notif = await notifService.deleteNotification(req.params.id, req.user.sub);
    if (!notif) return res.status(404).json({ error: 'Notifikasi tidak ditemukan' });
    res.json({ message: 'Notifikasi dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getNotifications, markAsRead, markAllAsRead, deleteNotification };
