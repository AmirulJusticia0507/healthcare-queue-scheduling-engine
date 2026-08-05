import { useState } from 'react'
import { useUsers } from '../hooks/useUsers'
import { pushToast } from '../lib/toast'

const btn = 'inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors disabled:opacity-50'
const EMPTY = { name: '', email: '', password: '', role: 'staff' }

function UsersPage() {
  const { users, loading, error, load, create, update, resetPw, remove } = useUsers()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ ...EMPTY })
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [resetId, setResetId] = useState(null)
  const [resetPwVal, setResetPwVal] = useState('')

  function startEdit(u) {
    setForm({ name: u.name, email: u.email, password: '', role: u.role })
    setEditingId(u.id)
    setShowForm(true)
  }

  function cancelForm() {
    setForm({ ...EMPTY })
    setEditingId(null)
    setShowForm(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim()) return pushToast({ title: 'Error', description: 'Nama & email wajib', type: 'error' })
    if (!editingId && !form.password) return pushToast({ title: 'Error', description: 'Password wajib untuk user baru', type: 'error' })
    setSaving(true)
    try {
      if (editingId) {
        await update(editingId, { name: form.name, email: form.email, role: form.role })
        pushToast({ title: 'User Diubah', type: 'success' })
      } else {
        await create(form)
        pushToast({ title: 'User Ditambahkan', type: 'success' })
      }
      cancelForm()
    } catch (err) {
      pushToast({ title: 'Gagal', description: err.response?.data?.error || err.message, type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  async function handleResetPassword() {
    if (!resetPwVal || resetPwVal.length < 6) return pushToast({ title: 'Error', description: 'Password minimal 6 karakter', type: 'error' })
    try {
      await resetPw(resetId, resetPwVal)
      pushToast({ title: 'Password Direset', type: 'success' })
      setResetId(null)
      setResetPwVal('')
    } catch (err) {
      pushToast({ title: 'Gagal', description: err.response?.data?.error || err.message, type: 'error' })
    }
  }

  async function handleDelete(u) {
    if (!window.confirm(`Hapus user "${u.name}"?`)) return
    try {
      await remove(u.id)
      pushToast({ title: 'User Dihapus', type: 'success' })
    } catch (err) {
      pushToast({ title: 'Gagal', description: err.response?.data?.error || err.message, type: 'error' })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">User Management</h1>
        <div className="flex gap-2">
          <button onClick={load} disabled={loading} className={`${btn} border-gray-300 text-gray-700 hover:bg-gray-100`}>{loading ? 'Memuat...' : 'Muat Ulang'}</button>
          <button onClick={() => { cancelForm(); setShowForm(true) }} className={`${btn} border-green-300 bg-green-600 text-white hover:bg-green-700`}>+ Tambah User</button>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-3 py-2">{error}</div>}

      {showForm && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-indigo-900 mb-3">{editingId ? 'Ubah User' : 'Tambah User'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nama *</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="block w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="block w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm" />
            </div>
            {!editingId && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Password *</label>
                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="block w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm" />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="block w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm">
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
                <option value="doctor">Doctor</option>
              </select>
            </div>
            <div className="col-span-2 flex gap-2">
              <button type="submit" disabled={saving} className={`${btn} border-indigo-300 bg-indigo-600 text-white hover:bg-indigo-700`}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
              <button type="button" onClick={cancelForm} className={`${btn} border-gray-300 text-gray-700 hover:bg-gray-100`}>Batal</button>
            </div>
          </form>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetId && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-amber-900 mb-2">Reset Password</h3>
          <div className="flex gap-2 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Password Baru</label>
              <input type="password" value={resetPwVal} onChange={e => setResetPwVal(e.target.value)} className="block w-64 border border-gray-300 rounded-md px-2 py-1.5 text-sm" />
            </div>
            <button onClick={handleResetPassword} className={`${btn} border-amber-300 bg-amber-600 text-white hover:bg-amber-700`}>Reset</button>
            <button onClick={() => { setResetId(null); setResetPwVal('') }} className={`${btn} border-gray-300 text-gray-700 hover:bg-gray-100`}>Batal</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-200">
              <th className="px-4 py-2 font-medium">Nama</th>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Role</th>
              <th className="px-4 py-2 font-medium">Dibuat</th>
              <th className="px-4 py-2 font-medium">Aksi</th>
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
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-4 text-center text-gray-500">Tidak ada user</td></tr>
            ) : (
              users.map(u => (
                <tr key={u.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">{u.name}</td>
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2">
                    <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${u.role === 'admin' ? 'bg-amber-100 text-amber-800' : u.role === 'doctor' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'}`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-2 text-xs">{u.created_at ? new Date(u.created_at).toLocaleDateString('id-ID') : '-'}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <button onClick={() => startEdit(u)} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 mr-2">Ubah</button>
                    <button onClick={() => { setResetId(u.id); setResetPwVal('') }} className="text-xs font-semibold text-amber-600 hover:text-amber-700 mr-2">Reset PW</button>
                    <button onClick={() => handleDelete(u)} className="text-xs font-semibold text-red-600 hover:text-red-700">Hapus</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default UsersPage
