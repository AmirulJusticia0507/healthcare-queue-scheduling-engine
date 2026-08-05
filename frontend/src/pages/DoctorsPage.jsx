import { useState } from 'react'
import { useDoctors } from '../hooks/useDoctors'
import { useClinic } from '../contexts/ClinicContext'
import DoctorsTable from '../components/DoctorsTable'
import AddDoctorForm from '../components/AddDoctorForm'
import { pushToast } from '../lib/toast'
import { useAuth } from '../contexts/AuthContext'

const btn =
  'inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors disabled:opacity-50'

function DoctorsPage() {
  const { clinicId } = useClinic()
  const { doctors, loading, error, createDoctor, updateDoctor, removeDoctor } = useDoctors(clinicId)
  const { user } = useAuth()
  const canManage = user?.role === 'admin'

  const [editingDoctor, setEditingDoctor] = useState(null)
  const [editName, setEditName] = useState('')
  const [editTime, setEditTime] = useState(15)
  const [saving, setSaving] = useState(false)

  function handleCreateDoctor(name, avgConsultTime) {
    createDoctor(name, avgConsultTime)
      .then(() => pushToast({ title: 'Dokter Ditambahkan', description: `${name} (${avgConsultTime} mnt)`, type: 'success' }))
      .catch((err) => pushToast({ title: 'Gagal Tambah Dokter', description: err.response?.data?.error || err.message, type: 'error' }))
  }

  function startEdit(d) {
    setEditingDoctor(d)
    setEditName(d.name)
    setEditTime(d.avg_consult_time)
  }

  function cancelEdit() {
    setEditingDoctor(null)
    setEditName('')
    setEditTime(15)
  }

  async function handleUpdate() {
    if (!editName.trim()) return
    setSaving(true)
    try {
      await updateDoctor(editingDoctor.id, { name: editName.trim(), avgConsultTime: Number(editTime) })
      pushToast({ title: 'Dokter Diubah', description: editName.trim(), type: 'success' })
      cancelEdit()
    } catch (err) {
      pushToast({ title: 'Gagal Ubah', description: err.response?.data?.error || err.message, type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  function handleDelete(d) {
    if (!window.confirm(`Hapus dokter "${d.name}"?`)) return
    removeDoctor(d.id)
      .then(() => pushToast({ title: 'Dokter Dihapus', description: d.name, type: 'success' }))
      .catch((err) => pushToast({ title: 'Gagal Hapus', description: err.response?.data?.error || err.message, type: 'error' }))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Daftar Dokter</h1>
        <button
          onClick={() => window.location.reload()}
          disabled={loading}
          className={`${btn} border-gray-300 text-gray-700 hover:bg-gray-100`}
        >
          {loading ? 'Memuat...' : 'Muat Ulang'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-3 py-2">
          {error}
        </div>
      )}

      {canManage ? (
        <AddDoctorForm onSubmit={handleCreateDoctor} loading={loading} />
      ) : (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-md px-3 py-2">
          Hanya admin yang dapat menambah dokter. Anda login sebagai <strong>{user?.role}</strong>.
        </div>
      )}

      {editingDoctor && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-indigo-900 mb-2">Ubah Dokter</h3>
          <div className="flex gap-2 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nama</label>
              <input value={editName} onChange={(e) => setEditName(e.target.value)} className="block w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Konsultasi (mnt)</label>
              <input type="number" value={editTime} onChange={(e) => setEditTime(e.target.value)} className="block w-24 border border-gray-300 rounded-md px-2 py-1.5 text-sm" />
            </div>
            <button onClick={handleUpdate} disabled={saving} className={`${btn} border-indigo-300 bg-indigo-600 text-white hover:bg-indigo-700`}>
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
            <button onClick={cancelEdit} className={`${btn} border-gray-300 text-gray-700 hover:bg-gray-100`}>Batal</button>
          </div>
        </div>
      )}

      <DoctorsTable doctors={doctors} loading={loading} onEdit={startEdit} onDelete={handleDelete} canManage={canManage} />
    </div>
  )
}

export default DoctorsPage
