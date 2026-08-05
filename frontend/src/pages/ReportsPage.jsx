import { useReports } from '../hooks/useReports'
import { useClinic } from '../contexts/ClinicContext'

function BarChart({ data, labelKey, valueKey, title }) {
  if (!data || !data.length) return <p className="text-sm text-gray-400">Tidak ada data</p>
  const max = Math.max(...data.map(d => d[valueKey]))
  return (
    <div>
      <h3 className="text-sm font-semibold mb-2">{title}</h3>
      <div className="space-y-1">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="w-24 text-right text-gray-600 truncate">{d[labelKey]}</span>
            <div className="flex-1 bg-gray-100 rounded h-4 overflow-hidden">
              <div className="bg-brand-500 h-full rounded" style={{ width: `${max ? (d[valueKey] / max) * 100 : 0}%` }} />
            </div>
            <span className="w-8 text-right font-medium">{d[valueKey]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, color }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

function ReportsPage() {
  const { clinicId } = useClinic()
  const { stats, loading, error } = useReports(clinicId)

  if (loading) return <div className="text-sm text-gray-500">Memuat data...</div>
  if (error) return <div className="text-sm text-red-500">{error}</div>
  if (!stats) return null

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold">Laporan & Analitik</h1>

      {/* Queue Stats */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Antrian Hari Ini</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Menunggu" value={stats.queue.today.waiting} color="text-amber-600" />
          <StatCard label="Selesai" value={stats.queue.today.done} color="text-emerald-600" />
          <StatCard label="Total Hari Ini" value={stats.queue.today.total} color="text-brand-600" />
          <StatCard label="Rata-rata Tunggu" value={`${stats.queue.today.avgWaitMinutes} mnt`} color="text-blue-600" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Queue Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <BarChart data={stats.queue.daily.slice().reverse()} labelKey="date" valueKey="count" title="Antrian per Hari (30 hari terakhir)" />
        </div>

        {/* Status Breakdown */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <BarChart data={stats.queue.statusBreakdown} labelKey="status" valueKey="count" title="Status Antrian" />
        </div>
      </div>

      {/* Appointment Stats */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Janji Temu</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <StatCard label="Hari Ini" value={stats.appointments.todayCount} color="text-brand-600" />
          <StatCard label="Terkonfirmasi" value={stats.appointments.upcomingConfirmed} color="text-emerald-600" />
          <StatCard label="Total Dokter" value={stats.doctors} color="text-indigo-600" />
        </div>
      </div>

      {/* Appointment Status */}
      {stats.appointments.statusBreakdown.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <BarChart data={stats.appointments.statusBreakdown} labelKey="status" valueKey="count" title="Status Janji Temu" />
        </div>
      )}

      {/* Patient Stats */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Pasien</h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Total Pasien" value={stats.patients.total} color="text-brand-600" />
          {stats.patients.byGender.map(g => (
            <StatCard key={g.gender} label={g.gender === 'P' ? 'Perempuan' : 'Laki-laki'} value={g.count} color={g.gender === 'P' ? 'text-pink-600' : 'text-blue-600'} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default ReportsPage
