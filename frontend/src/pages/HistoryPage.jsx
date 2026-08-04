import { useState, useCallback } from 'react'
import StatusBadge from '../components/StatusBadge'
import { useHistory } from '../hooks/useHistory'
import { downloadHistoryCsv } from '../services/queueService'
import { pushToast } from '../lib/toast'

const STATUS_FILTERS = [{ value: '', label: 'Semua' }, { value: 'waiting', label: 'Waiting' }, { value: 'skipped', label: 'Skipped' }, { value: 'called', label: 'Called' }, { value: 'done', label: 'Done' }]

function HistoryPage() {
  const [status, setStatus] = useState('')
  const [q, setQ] = useState('')

  const { items, total, totalPages, page, limit, loading, error, reload, goToPage } = useHistory({ status, q })

  const onSearch = useCallback(
    (e) => {
      setQ(e.target.value)
    },
    []
  )

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Riwayat Antrian</h1>
        <p className="text-sm text-gray-500">Semua pasien yang pernah masuk antrian (waiting / skipped / called / done)</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-3 py-2">{error}</div>
      )}

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          >
            {STATUS_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Cari pasien</label>
          <input
            type="search"
            placeholder="Nama pasien..."
            value={q}
            onChange={onSearch}
            className="w-48 px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div>
          <button onClick={reload} disabled={loading} className="px-2.5 py-1.5 text-xs font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 bg-white">
            {loading ? 'Memuat...' : 'Muat Ulang'}
          </button>
        </div>
        <div>
          <button
            onClick={async () => {
              try {
                await downloadHistoryCsv({ status, q })
                pushToast({ title: 'Export CSV', description: 'queue-history.csv diunduh', type: 'success' })
              } catch (err) {
                pushToast({ title: 'Export Gagal', description: err.message, type: 'error' })
              }
            }}
            className="px-2.5 py-1.5 text-xs font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 bg-white"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-200">
              <th className="px-4 py-2 font-medium">No</th>
              <th className="px-4 py-2 font-medium">Nama Pasien</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Join Pada</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-3 text-gray-400">Memuat…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-3 text-center text-gray-500">Belum ada riwayat</td></tr>
            ) : (
              items.map((p, idx) => (
                <tr key={p.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-2">{total - (page - 1) * limit - idx}</td>
                  <td className="px-4 py-2 font-medium">{p.patient_name}</td>
                  <td className="px-4 py-2"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-2">{new Date(p.joined_at).toLocaleString('id-ID')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>{total} entri</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => goToPage(Math.max(1, page - 1))}
            disabled={page <= 1 || loading}
            className="px-2 py-0.5 rounded border border-gray-300 disabled:opacity-50"
          >
            Prev
          </button>
          <span>Hal {page} / {totalPages}</span>
          <button
            onClick={() => goToPage(page + 1)}
            disabled={page >= totalPages || loading}
            className="px-2 py-0.5 rounded border border-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

export default HistoryPage
