import { useState } from 'react'
import { usePatients } from '../hooks/usePatients'
import { useAuth } from '../contexts/AuthContext'
import { pushToast } from '../lib/toast'

const btn =
  'inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors disabled:opacity-50'

const EMPTY = { name: '', date_of_birth: '', gender: 'L', phone: '', email: '', address: '', medical_record_number: '' }

function PatientsPage() {
  const { user } = useAuth()
  const canWrite = user?.role === 'admin' || user?.role === 'staff'
  const canDelete = user?.role === 'admin'

  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const { patients, total, loading, error, load, create, update, remove } = usePatients({ page, limit: 10, q })

  const [form, setForm] = useState({ ...EMPTY })
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const totalPages = Math.max(1, Math.ceil(total / 10))

  function resetForm() {
    setForm({ ...EMPTY })
    setEditingId(null)
    setShowForm(false)
  }

  function startEdit(p) {
    setForm({
      name: p.name || '',
      date_of_birth: p.date_of_birth ? p.date_of_birth.slice(0, 10) : '',
      gender: p.gender || 'L',
      phone: p.phone || '',
      email: p.email || '',
      address: p.address || '',
      medical_record_number: p.medical_record_number || '',
    })
    setEditingId(p.id)
    setShowForm(true)
  }

  function handleSearch(e) {
    e.preventDefault()
    setQ(searchInput)
    setPage(1)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) return pushToast({ title: 'Error', description: 'Nama wajib diisi', type: 'error' })
    setSaving(true)
    try {
      if (editingId) {
        await update(editingId, form)
        pushToast({ title: 'Pasien Diubah', description: form.name, type: 'success' })
      } else {
        await create(form)
        pushToast({ title: 'Pasien Ditambahkan', description: form.name, type: 'success' })
      }
      resetForm()
    } catch (err) {
      pushToast({ title: 'Gagal', description: err.response?.data?.error || err.message, type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  function handleDelete(p) {
    if (!window.confirm(`Hapus pasien "${p.name}"?`)) return
    remove(p.id)
      .then(() => pushToast({ title: 'Pasien Dihapus', description: p.name, type: 'success' }))
      .catch((err) => pushToast({ title: 'Gagal Hapus', description: err.response?.data?.error || err.message, type: 'error' }))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Daftar Pasien</h1>
        <div className="flex gap-2">
          <button onClick={load} disabled={loading} className={`${btn} border-gray-300 text-gray-700 hover:bg-gray-100`}>
            {loading ? 'Memuat...' : 'Muat Ulang'}
          </button>
          {canWrite && (
            <button onClick={() => { resetForm(); setShowForm(true) }} className={`${btn} border-green-300 bg-green-600 text-white hover:bg-green-700`}>
              + Tambah Pasien
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-3 py-2">{error}</div>
      )}

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Cari nama / MRN / telepon..."
          className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
        />
        <button type="submit" className={`${btn} border-gray-300 text-gray-700 hover:bg-gray-100`}>Cari</button>
      </form>

      {/* Form */}
      {showForm && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-indigo-900 mb-3">{editingId ? 'Ubah Pasien' : 'Tambah Pasien'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nama *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="block w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">No. RM</label>
              <input value={form.medical_record_number} onChange={(e) => setForm({ ...form, medical_record_number: e.target.value })} className="block w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tanggal Lahir</label>
              <input type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} className="block w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Jenis Kelamin</label>
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="block w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm">
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Telepon</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="block w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="block w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Alamat</label>
              <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} className="block w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm" />
            </div>
            <div className="col-span-2 flex gap-2">
              <button type="submit" disabled={saving} className={`${btn} border-indigo-300 bg-indigo-600 text-white hover:bg-indigo-700`}>
                {saving ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Tambah'}
              </button>
              <button type="button" onClick={resetForm} className={`${btn} border-gray-300 text-gray-700 hover:bg-gray-100`}>Batal</button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-200">
              <th className="px-4 py-2 font-medium">Nama</th>
              <th className="px-4 py-2 font-medium">No. RM</th>
              <th className="px-4 py-2 font-medium">L/P</th>
              <th className="px-4 py-2 font-medium">Telepon</th>
              <th className="px-4 py-2 font-medium">Email</th>
              {canWrite && <th className="px-4 py-2 font-medium">Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [1, 2, 3].map((n) => (
                <tr key={n} className="border-b border-gray-100">
                  {[1, 2, 3, 4, 5, 6].map((c) => (
                    <td key={c} className="px-4 py-2"><div className="h-4 bg-gray-200 animate-pulse rounded" /></td>
                  ))}
                </tr>
              ))
            ) : patients.length === 0 ? (
              <tr>
                <td colSpan={canWrite ? 6 : 5} className="px-4 py-4 text-center text-gray-500">Tidak ada data pasien</td>
              </tr>
            ) : (
              patients.map((p) => (
                <tr key={p.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">{p.name}</td>
                  <td className="px-4 py-2">{p.medical_record_number || '-'}</td>
                  <td className="px-4 py-2">{p.gender === 'P' ? 'Perempuan' : 'Laki-laki'}</td>
                  <td className="px-4 py-2">{p.phone || '-'}</td>
                  <td className="px-4 py-2">{p.email || '-'}</td>
                  {canWrite && (
                    <td className="px-4 py-2 whitespace-nowrap">
                      <button onClick={() => startEdit(p)} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 mr-2">Ubah</button>
                      {canDelete && (
                        <button onClick={() => handleDelete(p)} className="text-xs font-semibold text-red-600 hover:text-red-700">Hapus</button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
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

export default PatientsPage
