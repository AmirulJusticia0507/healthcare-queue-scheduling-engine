import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { updateProfile, changePassword } from '../services/userService'
import { pushToast } from '../lib/toast'

const btn = 'inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors disabled:opacity-50'

function ProfilePage() {
  const { user } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [saving, setSaving] = useState(false)

  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwSaving, setPwSaving] = useState(false)

  async function handleProfileUpdate(e) {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return pushToast({ title: 'Error', description: 'Nama & email wajib', type: 'error' })
    setSaving(true)
    try {
      await updateProfile({ name, email })
      pushToast({ title: 'Profil Diperbarui', type: 'success' })
    } catch (err) {
      pushToast({ title: 'Gagal', description: err.response?.data?.error || err.message, type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault()
    if (!currentPw || !newPw) return pushToast({ title: 'Error', description: 'Isi semua field', type: 'error' })
    if (newPw !== confirmPw) return pushToast({ title: 'Error', description: 'Password baru tidak cocok', type: 'error' })
    if (newPw.length < 6) return pushToast({ title: 'Error', description: 'Password minimal 6 karakter', type: 'error' })
    setPwSaving(true)
    try {
      await changePassword({ currentPassword: currentPw, newPassword: newPw })
      pushToast({ title: 'Password Diubah', type: 'success' })
      setCurrentPw('')
      setNewPw('')
      setConfirmPw('')
    } catch (err) {
      pushToast({ title: 'Gagal', description: err.response?.data?.error || err.message, type: 'error' })
    } finally {
      setPwSaving(false)
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-lg font-semibold">Profil Saya</h1>

      {/* Profile Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Informasi Profil</h2>
        <form onSubmit={handleProfileUpdate} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nama</label>
            <input value={name} onChange={e => setName(e.target.value)} className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
            <input value={user?.role || '-'} disabled className="block w-full border border-gray-200 bg-gray-50 rounded-md px-3 py-2 text-sm text-gray-500" />
          </div>
          <button type="submit" disabled={saving} className={`${btn} border-indigo-300 bg-indigo-600 text-white hover:bg-indigo-700`}>
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Ganti Password</h2>
        <form onSubmit={handleChangePassword} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Password Saat Ini</label>
            <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Password Baru</label>
            <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Konfirmasi Password Baru</label>
            <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <button type="submit" disabled={pwSaving} className={`${btn} border-amber-300 bg-amber-600 text-white hover:bg-amber-700`}>
            {pwSaving ? 'Mengubah...' : 'Ganti Password'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ProfilePage
