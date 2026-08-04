const queueService = require('./queue.service');
const { JWT_SECRET } = require('../auth/auth.service');
const jwt = require('jsonwebtoken');
const { subscribe } = require('../../utils/pubsub');

/**
 * GET /api/queue
 * Ambil queue pasien lengkap dengan assignedDoctor + estimatedTime
 */
async function getQueue(req, res) {
  try {
    const queue = await queueService.getQueueEntries();
    res.json(queue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * POST /api/queue
 * Tambah pasien baru dan return data pasien dengan assignedDoctor + estimatedTime
 */
async function joinQueue(req, res) {
  try {
    const { patientName } = req.body;

    // tambah pasien
    const entry = await queueService.addQueueEntry(patientName);

    // ambil seluruh queue lagi untuk hitung assignedDoctor + estimatedTime
    const queue = await queueService.getQueueEntries();

    // cari pasien yang baru saja ditambahkan
    const patientWithEstimate = queue.find(p => p.id === entry.id);

    res.status(201).json({
      entry: patientWithEstimate,
      estimatedTime: patientWithEstimate.estimatedTime
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * PATCH /api/queue/:id/skip
 * Skip pasien (dilewati sementara)
 */
async function skipPatient(req, res) {
  try {
    const entry = await queueService.skipPatient(req.params.id);
    if (!entry) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * PATCH /api/queue/:id/recall
 * Recall pasien yang dilewati (kembali ke antrian)
 */
async function recallPatient(req, res) {
  try {
    const entry = await queueService.recallPatient(req.params.id);
    if (!entry) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * GET /api/queue/history?status=...&page=1&limit=20&q=...
 * Riwayat semua entri (bisa filter status & nama) dengan paginasi.
 */
async function getHistory(req, res) {
  try {
    const { status, page, limit, q } = req.query;
    const data = await queueService.getHistory({
      status,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      q,
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * GET /api/queue/stream?token=... (SSE)
 * Dengeri `queue_update` event ketika antrian berubah; client refresh data.
 */
function stream(req, res) {
  const token = req.query.token;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const unsubscribe = subscribe(res);
  const heartbeat = setInterval(() => {
    res.write(': ping\n\n');
  }, 15000);

  req.on('close', () => {
    clearInterval(heartbeat);
    unsubscribe();
    res.end();
  });
}

module.exports = {
  getQueue,
  joinQueue,
  skipPatient,
  recallPatient,
  getHistory,
  stream,
};
