import { useState } from 'react'
import StatusBadge from './StatusBadge'

function formatTime(ms) {
  if (!ms) return '-'
  return new Date(ms).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const btn =
  'inline-flex items-center px-2 py-1 text-xs font-medium rounded-md border transition-colors disabled:opacity-50'

function QueueTable({ queue, loading, onSkip, onRecall, onRowClick }) {
  const [skipTarget, setSkipTarget] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const confirmSkip = async () => {
    if (!skipTarget) return
    setSubmitting(true)
    try {
      await onSkip(skipTarget.id)
      setSkipTarget(null)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-200">
              <th className="px-4 py-2 font-medium">No</th>
              <th className="px-4 py-2 font-medium">Nama Pasien</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Estimasi</th>
              <th className="px-4 py-2 font-medium">Dokter Ditugaskan</th>
              <th className="px-4 py-2 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map((n) => (
              <tr key={n} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-2"><div className="h-4 bg-gray-200 animate-pulse rounded" /></td>
                <td className="px-4 py-2"><div className="h-4 bg-gray-200 animate-pulse rounded" /></td>
                <td className="px-4 py-2"><div className="h-4 bg-gray-200 animate-pulse rounded w-5/6" /></td>
                <td className="px-4 py-2"><div className="h-4 bg-gray-200 animate-pulse rounded" /></td>
                <td className="px-4 py-2"><div className="h-4 bg-gray-200 animate-pulse rounded" /></td>
                <td className="px-4 py-2"><div className="h-4 bg-gray-200 animate-pulse rounded" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-200">
              <th className="px-4 py-2 font-medium">No</th>
              <th className="px-4 py-2 font-medium">Nama Pasien</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Estimasi</th>
              <th className="px-4 py-2 font-medium">Dokter Ditugaskan</th>
              <th className="px-4 py-2 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {queue.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-4 text-center text-gray-500">
                  Antrian kosong
                </td>
              </tr>
            ) : (
              queue.map((p, idx) => (
                <tr key={p.id} className="border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50" onClick={() => onRowClick?.(p)}>
                  <td className="px-4 py-2">{idx + 1}</td>
                  <td className="px-4 py-2 font-medium">{p.patient_name}</td>
                  <td className="px-4 py-2">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-4 py-2">{p.estimatedTime} mnt</td>
                  <td className="px-4 py-2">
                    {p.assignedDoctor ? p.assignedDoctor.name : '-'}
                    {p.assignedDoctor && (
                      <span className="text-gray-500 text-xs">
                        {' '}
                        ({formatTime(p.assignedDoctor.availableAt)})
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {p.status === 'waiting' ? (
                      <button
                        type="button"
                        onClick={() => setSkipTarget(p)}
                        className={`${btn} border-red-300 text-red-600 hover:bg-red-50`}
                      >
                        Skip
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onRecall(p.id)}
                        className={`${btn} border-emerald-300 text-emerald-600 hover:bg-emerald-50`}
                      >
                        Recall
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {skipTarget && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !submitting && setSkipTarget(null)}
          />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-sm p-5">
            <h3 className="text-base font-semibold text-gray-900">Skip Pasien?</h3>
            <p className="text-sm text-gray-600 mt-2">
              Pasien <strong>{skipTarget.patient_name}</strong> akan dilewati sementara dan dokter
              yang ditugaskan akan dibebaskan.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setSkipTarget(null)}
                className={`${btn} border-gray-300 text-gray-700 hover:bg-gray-100`}
              >
                Batal
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={confirmSkip}
                className={`${btn} border-transparent bg-red-600 text-white hover:bg-red-700`}
              >
                {submitting ? 'Memproses...' : 'Ya, Skip'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default QueueTable
