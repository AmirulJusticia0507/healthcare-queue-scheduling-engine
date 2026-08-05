import { useCallback, useEffect, useState } from 'react'
import * as auditService from '../services/auditService'

const btn = 'inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors disabled:opacity-50'

function AuditPage() {
  const [logs, setLogs] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await auditService.getAuditLogs({ page, limit: 30 })
      setLogs(data.items || [])
      setTotal(data.total || 0)
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { load() }, [load])

  const totalPages = Math.max(1, Math.ceil(total / 30))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Audit Trail</h1>
        <button onClick={load} disabled={loading} className={`${btn} border-gray-300 text-gray-700 hover:bg-gray-100`}>
          {loading ? 'Memuat...' : 'Muat Ulang'}
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-3 py-2">{error}</div>}

      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-200">
              <th className="px-4 py-2 font-medium">Waktu</th>
              <th className="px-4 py-2 font-medium">User</th>
              <th className="px-4 py-2 font-medium">Aksi</th>
              <th className="px-4 py-2 font-medium">Entitas</th>
              <th className="px-4 py-2 font-medium">Detail</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [1, 2, 3].map(n => (
                <tr key={n} className="border-b border-gray-100">
                  {[1, 2, 3, 4, 5].map(c => (
                    <td key={c} className="px-4 py-2"><div className="h-4 bg-gray-200 animate-pulse rounded" /></td>
                  ))}
                </tr>
              ))
            ) : logs.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-4 text-center text-gray-500">Tidak ada data audit</td></tr>
            ) : (
              logs.map(log => (
                <tr key={log.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-2 text-xs whitespace-nowrap">{new Date(log.created_at).toLocaleString('id-ID')}</td>
                  <td className="px-4 py-2">{log.user_name || log.user_email || '-'}</td>
                  <td className="px-4 py-2"><span className="px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 rounded">{log.action}</span></td>
                  <td className="px-4 py-2">{log.entity_type || '-'} #{log.entity_id || '-'}</td>
                  <td className="px-4 py-2 text-xs text-gray-600 max-w-xs truncate">{log.details || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-1">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className={`${btn} border-gray-300 text-gray-700 hover:bg-gray-100`}>Sebelumnya</button>
          <span className="px-3 py-1 text-xs text-gray-500">Halaman {page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className={`${btn} border-gray-300 text-gray-700 hover:bg-gray-100`}>Berikutnya</button>
        </div>
      )}
    </div>
  )
}

export default AuditPage
