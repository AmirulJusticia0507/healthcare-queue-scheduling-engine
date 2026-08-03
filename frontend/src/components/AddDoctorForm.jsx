import { useState } from 'react'

const inputClass =
  'block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500'

function AddDoctorForm({ onSubmit, loading }) {
  const [name, setName] = useState('')
  const [avgConsultTime, setAvgConsultTime] = useState('15')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    await onSubmit(name.trim(), Number(avgConsultTime))
    setName('')
    setAvgConsultTime('15')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-200 rounded-lg p-4 space-y-3"
    >
      <div>
        <label htmlFor="doctor-name" className="block text-sm font-medium text-gray-700 mb-1">
          Nama Dokter
        </label>
        <input
          id="doctor-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Dr. Budi"
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="consult-time" className="block text-sm font-medium text-gray-700 mb-1">
          Konsultasi (menit)
        </label>
        <input
          id="consult-time"
          type="number"
          min={1}
          required
          value={avgConsultTime}
          onChange={(e) => setAvgConsultTime(e.target.value)}
          className={inputClass}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full px-3 py-2 text-sm font-medium rounded-md bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {loading ? 'Memproses...' : 'Tambah Dokter'}
      </button>
    </form>
  )
}

export default AddDoctorForm
