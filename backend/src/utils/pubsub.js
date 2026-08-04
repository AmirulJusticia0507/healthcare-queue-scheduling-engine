// Minimal in-memory pub/sub untuk SSE. Subscriber = HTTP response object.
const subscribers = new Set();

function subscribe(res) {
  subscribers.add(res);
  return () => subscribers.delete(res);
}

function publish(event, data) {
  if (subscribers.size === 0) return;
  let payload;
  try {
    payload = JSON.stringify(data);
  } catch {
    payload = '{}';
  }
  const message = `event: ${event}\ndata: ${payload}\n\n`;
  for (const res of subscribers) {
    try {
      res.write(message);
    } catch {
      subscribers.delete(res);
    }
  }
}

module.exports = { subscribe, publish };
