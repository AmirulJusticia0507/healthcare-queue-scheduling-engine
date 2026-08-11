import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('admin@health.id')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [captchaToken, setCaptchaToken] = useState('')
  const captchaRef = useRef(null)

  useEffect(() => {
    const el = document.querySelector('cap-widget')
    if (!el) return
    const observer = new MutationObserver(() => {
      const token = el.getAttribute('data-cap-response')
      if (token) setCaptchaToken(token)
    })
    observer.observe(el, { attributes: true, attributeFilter: ['data-cap-response'] })
    return () => observer.disconnect()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    if (!captchaToken) {
      setError('Silakan selesaikan CAPTCHA terlebih dahulu')
      setSubmitting(false)
      return
    }

    try {
      await login(email, password, captchaToken)
    } catch (err) {
      const d = err?.response?.data
      if (err?.response?.status === 429 && d?.retrySeconds) {
        setError(`${d.error || 'Terlalu banyak percobaan'}. Coba lagi dalam ${d.retrySeconds}s.`)
      } else {
        setError(d?.error || err.message || 'Login gagal')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white border border-gray-200 rounded-lg shadow-xl p-6">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">Healthcare Queue</h1>
          <p className="text-sm text-gray-500 mb-5">Login untuk melanjutkan</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-3 py-2 mb-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Verifikasi</label>
              <div ref={captchaRef}>
                <cap-widget data-cap-api-endpoint="https://spl.jogjaprov.go.id/captcha/79fb58190a/"></cap-widget>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !captchaToken}
              className="w-full px-3 py-2 text-sm font-medium rounded-md bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {submitting ? 'Masuk...' : 'Login'}
            </button>
          </form>

          <p className="text-xs text-gray-400 mt-4 text-center">
            Akun demo: admin@health.id / admin123
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
