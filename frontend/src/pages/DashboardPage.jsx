import { Box, Heading, SimpleGrid, Table, Text } from '@chakra-ui/react'
import { Card, Stat } from '@chakra-ui/react'
import { useDoctors } from '../hooks/useDoctors'
import { useQueue } from '../hooks/useQueue'
import StatusBadge from '../components/StatusBadge'

function StatCard({ label, value, help, tone }) {
  return (
    <Card.Root>
      <Card.Body>
        <Stat.Root>
          <Stat.Label>{label}</Stat.Label>
          <Stat.ValueText color={tone}>{value}</Stat.ValueText>
          <Stat.HelpText>{help}</Stat.HelpText>
        </Stat.Root>
      </Card.Body>
    </Card.Root>
  )
}

function DashboardPage() {
  const { queue, loading: queueLoading } = useQueue()
  const { doctors, loading: doctorsLoading } = useDoctors()

  const waitingCount = queue.filter((p) => p.status === 'waiting').length
  const skippedCount = queue.filter((p) => p.status === 'skipped').length
  const nextPatient = queue.find((p) => p.status === 'waiting')
  const nextEstimate = nextPatient ? nextPatient.estimatedTime : 0
  const preview = queue.slice(0, 5)

  return (
    <Box>
      <Heading size="lg" mb="1">
        Dashboard
      </Heading>
      <Text color="gray.500" fontSize="sm" mb="5">
        Ringkasan antrian dan ketersediaan dokter
      </Text>

      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="4" mb="6">
        <StatCard label="Menunggu" value={queueLoading ? '...' : waitingCount} help="pasien dalam antrian" tone="orange.500" />
        <StatCard label="Di-skip" value={queueLoading ? '...' : skippedCount} help="pasien dilewati" tone="red.500" />
        <StatCard label="Total Dokter" value={doctorsLoading ? '...' : doctors.length} help="dokter aktif" tone="brand.500" />
        <StatCard label="Estimasi Berikutnya" value={queueLoading ? '...' : `${nextEstimate} mnt`} help={nextPatient ? `untuk ${nextPatient.patient_name}` : 'antrian kosong'} tone="green.500" />
      </SimpleGrid>

      <Card.Root>
        <Card.Header>
          <Card.Title size="sm">Antrian Terbaru</Card.Title>
        </Card.Header>
        <Card.Body>
          {preview.length === 0 ? (
            <Text color="gray.500" fontSize="sm">
              Belum ada pasien dalam antrian.
            </Text>
          ) : (
            <Table.Root size="sm" variant="line">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>No</Table.ColumnHeader>
                  <Table.ColumnHeader>Pasien</Table.ColumnHeader>
                  <Table.ColumnHeader>Status</Table.ColumnHeader>
                  <Table.ColumnHeader>Estimasi</Table.ColumnHeader>
                  <Table.ColumnHeader>Dokter</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {preview.map((p, idx) => (
                  <Table.Row key={p.id}>
                    <Table.Cell>{idx + 1}</Table.Cell>
                    <Table.Cell fontWeight="medium">{p.patient_name}</Table.Cell>
                    <Table.Cell>
                      <StatusBadge status={p.status} />
                    </Table.Cell>
                    <Table.Cell>{p.estimatedTime} mnt</Table.Cell>
                    <Table.Cell>{p.assignedDoctor ? p.assignedDoctor.name : '-'}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          )}
        </Card.Body>
      </Card.Root>
    </Box>
  )
}

export default DashboardPage
