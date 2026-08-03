import { useDoctors } from '../hooks/useDoctors'
import DoctorsTable from '../components/DoctorsTable'
import AddDoctorForm from '../components/AddDoctorForm'
import { pushToast } from '../lib/toast'

const btn =
  'inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors disabled:opacity-50'

function DoctorsPage() {
  const { doctors, loading, error, createDoctor } = useDoctors()

  const handleCreateDoctor = async (name, avgConsultTime) => {
    try {
      await createDoctor(name, avgConsultTime)
      pushToast({
        title: 'Dokter Ditambahkan',
        description: `${name} (${avgConsultTime} mnt)`,
        type: 'success',
      })
    } catch (err) {
      pushToast({
        title: 'Gagal Tambah Dokter',
        description: err.message,
        type: 'error',
      })
    }
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

      <AddDoctorForm onSubmit={handleCreateDoctor} loading={loading} />
      <DoctorsTable doctors={doctors} loading={loading} />
    </div>
  )
}

export default DoctorsPage
