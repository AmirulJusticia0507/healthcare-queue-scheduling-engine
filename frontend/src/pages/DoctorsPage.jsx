import { Alert, Heading, Stack } from '@chakra-ui/react'
import { useDoctors } from '../hooks/useDoctors'
import DoctorsTable from '../components/DoctorsTable'
import AddDoctorForm from '../components/AddDoctorForm'

function DoctorsPage() {
  const { doctors, loading, error, createDoctor } = useDoctors()

  return (
    <Stack spacing="4">
      <Heading size="md">Daftar Dokter</Heading>
      {error && (
        <Alert.Root status="error">
          <Alert.Indicator />
          <Alert.Title>{error}</Alert.Title>
        </Alert.Root>
      )}
      <AddDoctorForm onSubmit={createDoctor} loading={loading} />
      <DoctorsTable doctors={doctors} loading={loading} />
    </Stack>
  )
}

export default DoctorsPage
