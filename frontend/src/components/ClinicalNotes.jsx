import { useState, useEffect } from 'react'
import { pushToast } from '../lib/toast'
import * as queueService from '../services/queueService'

function ClinicalNotes({ patientId, onClose }) {
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (patientId) {
      loadNotes()
    }
  }, [patientId])

  const loadNotes = async () => {
    try {
      const res = await queueService.getPatient(patientId)
      if (res.clinical_notes) setNotes(res.clinical_notes)
    } catch (err) {
      console.error('Failed to load notes:', err)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await queueService.setClinicalNotes(patientId, notes)
      pushToast({ title: 'Catatan Tersimpan', description: 'Catatan klinis berhasil diperbarui', type: 'success' })
    } catch (err) {
      pushToast({ title: 'Gagal Menyimpan', description: err.response?.data?.error || err.message, type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-gray-900">Catatan Klinis</h4>
        <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700">Tutup</button>
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={4}
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
        placeholder="Tulis catatan klinis dokter di sini..."
      />
      <div className="mt-3 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-3 py-1.5 text-xs font-medium rounded-md bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {saving ? 'Menyimpan...' : 'Simpan Catatan'}
        </button>
      </div>
    </div>
  )
}

export default ClinicalNotes