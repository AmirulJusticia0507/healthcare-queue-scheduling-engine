import { Alert, Button, Heading, HStack, Stack } from '@chakra-ui/react'
import { useQueue } from '../hooks/useQueue'
import QueueTable from '../components/QueueTable'
import JoinQueueForm from '../components/JoinQueueForm'

function QueuePage() {
  const { queue, loading, error, addPatient, skip, recall } = useQueue()

  return (
    <Stack spacing="4">
      <HStack justify="space-between">
        <Heading size="md">Antrian Pasien</Heading>
        <Button
          size="sm"
          variant="outline"
          onClick={() => window.location.reload()}
        >
          Muat Ulang
        </Button>
      </HStack>
      {error && (
        <Alert.Root status="error">
          <Alert.Indicator />
          <Alert.Title>{error}</Alert.Title>
        </Alert.Root>
      )}
      <JoinQueueForm onSubmit={addPatient} loading={loading} />
      <QueueTable queue={queue} loading={loading} onSkip={skip} onRecall={recall} />
    </Stack>
  )
}

export default QueuePage
