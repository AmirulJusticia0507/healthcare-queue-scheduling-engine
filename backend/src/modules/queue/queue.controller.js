const queueService = require('./queue.service');

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

module.exports = {
  getQueue,
  joinQueue
};
