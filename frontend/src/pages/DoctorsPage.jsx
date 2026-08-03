import { Alert, Heading, Stack } from '@chakra-ui/react'
import { useDoctors } from '../hooks/useDoctors'
import DoctorsTable from '../components/DoctorsTable'
import AddDoctorForm from '../components/AddDoctorForm'
import { toaster } from '../lib/toaster'

function DoctorsPage() {
  const { doctors, loading, error, createDoctor } = useDoctors()

  const handleCreateDoctor = async (name, avgConsultTime) => {
    try {
      await createDoctor(name, avgConsultTime)
      toaster.create({
        title: 'Dokter Ditambahkan',
        description: `${name} (${avgConsultTime} mnt)`,
        type: 'success',
      })
    } catch (err) {
      toaster.create({
        title: 'Gagal Tambah Dokter',
        description: err.message,
        type: 'error',
      })
    }
  }

  return (
    <Stack spacing="4">
      <Heading size="md">Daftar Dokter</Heading>
      {error && (
        <Alert.Root status="error">
          <Alert.Indicator />
          <Alert.Title>{error}</Alert.Title>
        </Alert.Root>
      )}
      <AddDoctorForm onSubmit={handleCreateDoctor} loading={loading} />
      <DoctorsTable doctors={doctors} loading={loading} />
    </Stack>
  )
}

export default DoctorsPage
