import { useQueue } from '../hooks/useQueue'
import QueueTable from '../components/QueueTable'
import JoinQueueForm from '../components/JoinQueueForm'
import { pushToast } from '../lib/toast'

const btn =
  'inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors disabled:opacity-50'

function QueuePage() {
  const { queue, loading, error, addPatient, skip, recall, reload } = useQueue({ live: true })

  const handleAddPatient = async (patientName) => {
    try {
      await addPatient(patientName)
      pushToast({
        title: 'Masuk Antrian',
        description: `${patientName} berhasil ditambahkan ke antrian`,
        type: 'success',
      })
    } catch (err) {
      pushToast({
        title: 'Gagal Tambah Pasien',
        description: err.message,
        type: 'error',
      })
    }
  }

  const handleSkip = async (id) => {
    try {
      await skip(id)
      pushToast({
        title: 'Pasien Di-skip',
        description: `Pasien #${id} dilewati sementara`,
        type: 'success',
      })
    } catch (err) {
      pushToast({
        title: 'Gagal Skip',
        description: err.message,
        type: 'error',
      })
    }
  }

  const handleRecall = async (id) => {
    try {
      await recall(id)
      pushToast({
        title: 'Pasien Di-recall',
        description: `Pasien #${id} kembali ke antrian`,
        type: 'success',
      })
    } catch (err) {
      pushToast({
        title: 'Gagal Recall',
        description: err.message,
        type: 'error',
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Antrian Pasien</h1>
        <button onClick={reload} disabled={loading} className={`${btn} border-gray-300 text-gray-700 hover:bg-gray-100`}>
          {loading ? 'Memuat...' : 'Muat Ulang'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-3 py-2">
          {error}
        </div>
      )}

      <JoinQueueForm onSubmit={handleAddPatient} loading={loading} />
      <QueueTable
        queue={queue}
        loading={loading}
        onSkip={handleSkip}
        onRecall={handleRecall}
      />
    </div>
  )
}

export default QueuePage
