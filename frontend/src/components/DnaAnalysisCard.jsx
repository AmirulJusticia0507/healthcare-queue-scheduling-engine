import { useEffect, useState } from 'react'
import * as dnaService from '../services/dnaService'
import { pushToast } from '../lib/toast'

export function useDnaPatient(externalId) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = async () => {
    if (!externalId) return
    setLoading(true)
    setError(null)
    try {
      const result = await dnaService.getDnaPatient(externalId)
      setData(result)
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [externalId])

  return { data, loading, error, reload: load }
}

export function DnaAnalysisCard({ externalId }) {
  const { data, loading, error, reload } = useDnaPatient(externalId)

  if (!externalId) {
    return (
      <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-md px-3 py-2">
        Pasien ini tidak memiliki ID analisis DNA. Tambahkan <code>patient_external_id</code> untuk melihat hasil analisis.
      </div>
    )
  }

  if (loading) {
    return <div className="text-sm text-gray-500">Memuat analisis DNA...</div>
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-3 py-2">
        Gagal memuat: {error}
        <button onClick={reload} className="ml-2 text-xs underline">Coba lagi</button>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="bg-gray-50 border border-gray-200 text-gray-600 text-sm rounded-md px-3 py-2">
        Tidak ditemukan data analisis DNA untuk ID: <code>{externalId}</code>
      </div>
    )
  }

  const { source, data: dnaData } = data
  const d = Array.isArray(dnaData) ? dnaData[0] : dnaData

  const formatValue = (key, val) => {
    if (val === null || val === undefined || val === '') return '—'
    if (typeof val === 'object') return JSON.stringify(val, null, 2)
    return val
  }

  const fields = Object.entries(d).filter(([k]) => k !== 'id' && k !== 'created_at' && k !== 'updated_at' && k !== 'external_id')

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <h3 className="font-semibold text-sm">Analisis DNA ({source})</h3>
        <span className="text-xs text-gray-500">ID: {externalId}</span>
      </div>
      <div className="p-4 max-h-64 overflow-auto">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          {fields.map(([key, val], i) => (
            <div key={i}>
              <dt className="text-gray-500 capitalize">{key.replace(/_/g, ' ')}</dt>
              <dd className="font-medium text-gray-900 whitespace-pre-wrap">{formatValue(key, val)}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}