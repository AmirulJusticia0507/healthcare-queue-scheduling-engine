// CAPTCHA verification middleware using Cap.js
// Verifies token server-side by calling the Cap.js API endpoint

const CAPTCHA_API_ENDPOINT = process.env.CAPTCHA_API_ENDPOINT || 'https://spl.jogjaprov.go.id/captcha/79fb58190a/'

async function verifyCaptcha(req, res, next) {
  const token = req.body?.captchaToken

  if (!token) {
    return res.status(400).json({ error: 'CAPTCHA token diperlukan' })
  }

  try {
    const response = await fetch(CAPTCHA_API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      return res.status(403).json({ error: 'CAPTCHA verifikasi gagal' })
    }

    next()
  } catch (err) {
    // If CAPTCHA service is unreachable, log warning but allow login (fail-open)
    console.warn('CAPTCHA service unreachable, allowing login:', err.message)
    next()
  }
}

module.exports = { verifyCaptcha }
