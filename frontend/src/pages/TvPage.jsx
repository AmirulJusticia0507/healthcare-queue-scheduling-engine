import { useEffect, useState } from 'react'
import axios from 'axios'
import { useSearchParams } from 'react-router-dom'
import { API_BASE } from '../config'

function fetchQueue(clinicId) {
  return axios.get(`${API_BASE}/queue/current`, { params: { clinic: clinicId } }).then((r) => r.data)
}

function TvPage() {
  const [searchParams] = useSearchParams()
  const [queue, setQueue] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const now = new Date()
  const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  const clinicId = Number(searchParams.get('clinic')) || 1

  useEffect(() => {
    let source
    const load = async () => {
      try {
        const data = await fetchQueue(clinicId)
        setQueue(data)
        setError(null)
      } catch (err) {
        setError(err?.response?.data?.error || err.message)
      } finally {
        setLoading(false)
      }
    }
    load()

    // Public SSE (tanpa auth) — auto refresh saat antrian berubah
    source = new EventSource(`${API_BASE}/queue/public-stream`)
    source.addEventListener('queue_update', () => load())
    source.onerror = (e) => {
      console.error('sse error', e)
    }

    const interval = setInterval(load, 30000); // jeda cadangan
    return () => {
      clearInterval(interval)
      if (source) source.close()
    }
  }, [clinicId])

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p className="text-red-300">Gagal memuat antrian: {error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 font-mono">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-baseline mb-6">
          <h1 className="text-2xl font-bold">ANTRIAN HARI INI</h1>
          <span className="text-sm text-gray-300">{timeStr}</span>
        </div>

        {loading && <p className="text-gray-400">Memuat…</p>}

        {queue.length === 0 ? (
          <p className="text-gray-400 text-2xl mt-8 text-center">Tidak ada pasien yang sedang antre. Terima kasih.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-gray-300 border-b border-gray-700">
                <th className="py-2">#</th>
                <th className="py-2">Nama Pasien</th>
                <th className="py-2">Estimasi</th>
                <th className="py-2">Dokter</th>
              </tr>
            </thead>
            <tbody>
              {queue.map((p, idx) => (
                <tr key={p.id} className={idx === 0 ? 'border-b border-gray-700' : 'border-b border-gray-800'}>
                  <td className={`py-3 text-2xl font-bold ${idx === 0 ? 'text-emerald-400' : 'text-gray-400'}`}>{idx + 1}</td>
                  <td className={`py-3 text-lg ${idx === 0 ? 'text-white' : 'text-gray-300'}`}>{p.patient_name}</td>
                  <td className="py-3 text-sm text-gray-300">{p.estimatedTime} mnt</td>
                  <td className="py-3 text-sm text-gray-400">
                    {p.assignedDoctor ? p.assignedDoctor.name : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <p className="mt-8 text-xs text-gray-500">Live — refresh otomatis via SSE</p>
      </div>
    </div>
  )
}

export default TvPage
