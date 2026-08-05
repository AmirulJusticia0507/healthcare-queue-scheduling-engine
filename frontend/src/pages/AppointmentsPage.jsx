import { useCallback, useEffect, useState } from 'react'
import * as appointmentService from '../services/appointmentService'
import { usePatients } from '../hooks/usePatients'
import { useDoctors } from '../hooks/useDoctors'
import { useClinic } from '../contexts/ClinicContext'
import { useAuth } from '../contexts/AuthContext'
import { pushToast } from '../lib/toast'

const btn = 'inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors disabled:opacity-50'
const EMPTY = { patientId: '', doctorId: '', appointmentDate: '', appointmentTime: '', reason: '', notes: '' }

function AppointmentsPage() {
  const { clinicId } = useClinic()
  const { user } = useAuth()
  const canManage = user?.role === 'admin'
  const { patients } = usePatients()
  const { doctors } = useDoctors(clinicId)

  const [appts, setAppts] = useState([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ ...EMPTY })
  const [saving, setSaving] = useState(false)
  const [filterDate, setFilterDate] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await appointmentService.getAppointments({ date: filterDate || undefined, status: filterStatus || undefined, page, limit: 20 })
      setAppts(data.items || [])
      setTotal(data.total || 0)
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    } finally {
      setLoading(false)
    }
  }, [page, filterDate, filterStatus])

  useEffect(() => { load() }, [load])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.patientId || !form.doctorId || !form.appointmentDate || !form.appointmentTime) {
      return pushToast({ title: 'Error', description: 'Isi semua field wajib', type: 'error' })
    }
    setSaving(true)
    try {
      await appointmentService.createAppointment(form)
      pushToast({ title: 'Janji Temu Dibuat', type: 'success' })
      setForm({ ...EMPTY })
      setShowForm(false)
      load()
    } catch (err) {
      pushToast({ title: 'Gagal', description: err.response?.data?.error || err.message, type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  async function handleStatus(id, status) {
    try {
      await appointmentService.updateAppointmentStatus(id, status)
      pushToast({ title: 'Status Diperbarui', type: 'success' })
      load()
    } catch (err) {
      pushToast({ title: 'Gagal', description: err.response?.data?.error || err.message, type: 'error' })
    }
  }

  async function handleConfirmToQueue(id) {
    try {
      await appointmentService.confirmToQueue(id)
      pushToast({ title: 'Pasien Dimasukkan ke Antrian', type: 'success' })
      load()
    } catch (err) {
      pushToast({ title: 'Gagal', description: err.response?.data?.error || err.message, type: 'error' })
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Hapus janji temu ini?')) return
    try {
      await appointmentService.deleteAppointment(id)
      pushToast({ title: 'Dihapus', type: 'success' })
      load()
    } catch (err) {
      pushToast({ title: 'Gagal', description: err.response?.data?.error || err.message, type: 'error' })
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / 20))
  const statusColors = { pending: 'bg-amber-100 text-amber-800', confirmed: 'bg-green-100 text-green-800', completed: 'bg-blue-100 text-blue-800', cancelled: 'bg-gray-100 text-gray-600', no_show: 'bg-red-100 text-red-800' }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Janji Temu</h1>
        <div className="flex gap-2">
          <button onClick={load} disabled={loading} className={`${btn} border-gray-300 text-gray-700 hover:bg-gray-100`}>{loading ? 'Memuat...' : 'Muat Ulang'}</button>
          <button onClick={() => { setForm({ ...EMPTY }); setShowForm(true) }} className={`${btn} border-green-300 bg-green-600 text-white hover:bg-green-700`}>+ Janji Baru</button>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-3 py-2">{error}</div>}

      {/* Filter */}
      <div className="flex gap-2">
        <input type="date" value={filterDate} onChange={e => { setFilterDate(e.target.value); setPage(1) }} className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm" />
        <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1) }} className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
          <option value="">Semua Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="no_show">No Show</option>
        </select>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-indigo-900 mb-3">Buat Janji Temu</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Pasien *</label>
              <select value={form.patientId} onChange={e => setForm({ ...form, patientId: e.target.value })} className="block w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm">
                <option value="">Pilih pasien</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.medical_record_number || '-'})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Dokter *</label>
              <select value={form.doctorId} onChange={e => setForm({ ...form, doctorId: e.target.value })} className="block w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm">
                <option value="">Pilih dokter</option>
                {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tanggal *</label>
              <input type="date" value={form.appointmentDate} onChange={e => setForm({ ...form, appointmentDate: e.target.value })} className="block w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Jam *</label>
              <input type="time" value={form.appointmentTime} onChange={e => setForm({ ...form, appointmentTime: e.target.value })} className="block w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Alasan</label>
              <input value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} className="block w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm" />
            </div>
            <div className="col-span-2 flex gap-2">
              <button type="submit" disabled={saving} className={`${btn} border-indigo-300 bg-indigo-600 text-white hover:bg-indigo-700`}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
              <button type="button" onClick={() => setShowForm(false)} className={`${btn} border-gray-300 text-gray-700 hover:bg-gray-100`}>Batal</button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-200">
              <th className="px-4 py-2 font-medium">Pasien</th>
              <th className="px-4 py-2 font-medium">Dokter</th>
              <th className="px-4 py-2 font-medium">Tanggal</th>
              <th className="px-4 py-2 font-medium">Jam</th>
              <th className="px-4 py-2 font-medium">Status</th>
              {canManage && <th className="px-4 py-2 font-medium">Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [1, 2, 3].map(n => (
                <tr key={n} className="border-b border-gray-100">
                  {[1, 2, 3, 4, 5, 6].map(c => (
                    <td key={c} className="px-4 py-2"><div className="h-4 bg-gray-200 animate-pulse rounded" /></td>
                  ))}
                </tr>
              ))
            ) : appts.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-4 text-center text-gray-500">Tidak ada janji temu</td></tr>
            ) : (
              appts.map(a => (
                <tr key={a.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">{a.patient_name}</td>
                  <td className="px-4 py-2">{a.doctor_name}</td>
                  <td className="px-4 py-2">{a.appointment_date?.slice(0, 10)}</td>
                  <td className="px-4 py-2">{a.appointment_time?.slice(0, 5)}</td>
                  <td className="px-4 py-2"><span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${statusColors[a.status] || ''}`}>{a.status}</span></td>
                  {canManage && (
                    <td className="px-4 py-2 whitespace-nowrap">
                      {a.status === 'pending' && <button onClick={() => handleStatus(a.id, 'confirmed')} className="text-[10px] font-semibold text-green-600 hover:text-green-800 mr-1">Konfirmasi</button>}
                      {a.status === 'confirmed' && <button onClick={() => handleConfirmToQueue(a.id)} className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 mr-1">Masukkan Antrian</button>}
                      {(a.status === 'pending' || a.status === 'confirmed') && (
                        <button onClick={() => handleStatus(a.id, 'cancelled')} className="text-[10px] font-semibold text-red-600 hover:text-red-800 mr-1">Batalkan</button>
                      )}
                      {canManage && <button onClick={() => handleDelete(a.id)} className="text-[10px] font-semibold text-red-400 hover:text-red-600">Hapus</button>}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-1">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className={`${btn} border-gray-300 text-gray-700 hover:bg-gray-100`}>Sebelumnya</button>
          <span className="px-3 py-1 text-xs text-gray-500">{page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className={`${btn} border-gray-300 text-gray-700 hover:bg-gray-100`}>Berikutnya</button>
        </div>
      )}
    </div>
  )
}

export default AppointmentsPage
