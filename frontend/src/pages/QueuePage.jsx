import { Alert, Button, Heading, HStack, Stack } from '@chakra-ui/react'
import { useQueue } from '../hooks/useQueue'
import QueueTable from '../components/QueueTable'
import JoinQueueForm from '../components/JoinQueueForm'
import { toaster } from '../lib/toaster'

function QueuePage() {
  const { queue, loading, error, addPatient, skip, recall, reload } = useQueue()

  const handleAddPatient = async (patientName) => {
    try {
      await addPatient(patientName)
      toaster.create({
        title: 'Masuk Antrian',
        description: `${patientName} berhasil ditambahkan ke antrian`,
        type: 'success',
      })
    } catch (err) {
      toaster.create({
        title: 'Gagal Tambah Pasien',
        description: err.message,
        type: 'error',
      })
    }
  }

  const handleSkip = async (id) => {
    try {
      await skip(id)
      toaster.create({
        title: 'Pasien Di-skip',
        description: `Pasien #${id} dilewati sementara`,
        type: 'success',
      })
    } catch (err) {
      toaster.create({
        title: 'Gagal Skip',
        description: err.message,
        type: 'error',
      })
    }
  }

  const handleRecall = async (id) => {
    try {
      await recall(id)
      toaster.create({
        title: 'Pasien Di-recall',
        description: `Pasien #${id} kembali ke antrian`,
        type: 'success',
      })
    } catch (err) {
      toaster.create({
        title: 'Gagal Recall',
        description: err.message,
        type: 'error',
      })
    }
  }

  return (
    <Stack spacing="4">
      <HStack justify="space-between">
        <Heading size="md">Antrian Pasien</Heading>
        <Button size="sm" variant="outline" onClick={reload} loading={loading}>
          Muat Ulang
        </Button>
      </HStack>
      {error && (
        <Alert.Root status="error">
          <Alert.Indicator />
          <Alert.Title>{error}</Alert.Title>
        </Alert.Root>
      )}
      <JoinQueueForm onSubmit={handleAddPatient} loading={loading} />
      <QueueTable
        queue={queue}
        loading={loading}
        onSkip={handleSkip}
        onRecall={handleRecall}
      />
    </Stack>
  )
}

export default QueuePage
