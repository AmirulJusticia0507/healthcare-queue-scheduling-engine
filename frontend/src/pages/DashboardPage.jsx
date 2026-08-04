import { useDoctors } from '../hooks/useDoctors'
import { useQueue } from '../hooks/useQueue'
import { useClinic } from '../contexts/ClinicContext'
import StatusBadge from '../components/StatusBadge'

function StatCard({ label, value, help, toneClass }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${toneClass}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-1">{help}</p>
    </div>
  )
}

function DashboardPage() {
  const { clinicId } = useClinic()
  const { queue, loading: queueLoading } = useQueue({ clinicId, live: true })
  const { doctors, loading: doctorsLoading } = useDoctors(clinicId)

  const waitingCount = queue.filter((p) => p.status === 'waiting').length
  const skippedCount = queue.filter((p) => p.status === 'skipped').length
  const nextPatient = queue.find((p) => p.status === 'waiting')
  const nextEstimate = nextPatient ? nextPatient.estimatedTime : 0
  const preview = queue.slice(0, 5)

  return (
    <div>
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <p className="text-sm text-gray-500 mb-5">Ringkasan antrian dan ketersediaan dokter</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Menunggu"
          value={queueLoading ? '...' : waitingCount}
          help="pasien dalam antrian"
          toneClass="text-amber-600"
        />
        <StatCard
          label="Di-skip"
          value={queueLoading ? '...' : skippedCount}
          help="pasien dilewati"
          toneClass="text-red-600"
        />
        <StatCard
          label="Total Dokter"
          value={doctorsLoading ? '...' : doctors.length}
          help="dokter aktif"
          toneClass="text-brand-600"
        />
        <StatCard
          label="Estimasi Berikutnya"
          value={queueLoading ? '...' : `${nextEstimate} mnt`}
          help={nextPatient ? `untuk ${nextPatient.patient_name}` : 'antrian kosong'}
          toneClass="text-emerald-600"
        />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-sm font-semibold">Antrian Terbaru</h2>
        </div>
        {!preview.length ? (
          <p className="px-4 py-4 text-sm text-gray-500">Belum ada pasien dalam antrian.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-200">
                  <th className="px-4 py-2 font-medium">No</th>
                  <th className="px-4 py-2 font-medium">Pasien</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 font-medium">Estimasi</th>
                  <th className="px-4 py-2 font-medium">Dokter</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((p, idx) => (
                  <tr key={p.id} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-2">{idx + 1}</td>
                    <td className="px-4 py-2 font-medium">{p.patient_name}</td>
                    <td className="px-4 py-2">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-2">{p.estimatedTime} mnt</td>
                    <td className="px-4 py-2">
                      {p.assignedDoctor ? p.assignedDoctor.name : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardPage
