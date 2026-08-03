import { useState } from 'react'

const inputClass =
  'block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500'

function JoinQueueForm({ onSubmit, loading }) {
  const [patientName, setPatientName] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!patientName.trim()) return
    await onSubmit(patientName.trim())
    setPatientName('')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-200 rounded-lg p-4 space-y-3"
    >
      <div>
        <label htmlFor="patient-name" className="block text-sm font-medium text-gray-700 mb-1">
          Nama Pasien
        </label>
        <input
          id="patient-name"
          type="text"
          required
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
          placeholder="Nama pasien"
          className={inputClass}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full px-3 py-2 text-sm font-medium rounded-md bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {loading ? 'Memproses...' : 'Masuk Antrian'}
      </button>
    </form>
  )
}

export default JoinQueueForm
