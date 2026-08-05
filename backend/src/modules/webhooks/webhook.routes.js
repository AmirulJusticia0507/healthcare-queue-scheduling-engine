const express = require('express');
const router = express.Router();
const webhookService = require('./webhook.service');
const { authorize } = require('../../middleware/role');

router.get('/', authorize(['admin']), async (req, res) => {
  try {
    const hooks = await webhookService.getWebhooks();
    res.json(hooks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authorize(['admin']), async (req, res) => {
  try {
    const { url, events } = req.body;
    if (!url) return res.status(400).json({ error: 'url required' });
    const hook = await webhookService.registerWebhook(url, events);
    res.status(201).json(hook);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authorize(['admin']), async (req, res) => {
  try {
    const hook = await webhookService.deleteWebhook(req.params.id);
    if (!hook) return res.status(404).json({ error: 'Webhook not found' });
    res.json({ message: 'Webhook deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
