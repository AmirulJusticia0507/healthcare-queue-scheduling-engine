import { Skeleton, Table } from '@chakra-ui/react'

function formatAvailable(availableAt) {
  if (!availableAt) return '-'
  return new Date(availableAt).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function DoctorsTable({ doctors, loading }) {
  if (loading) {
    return (
      <Table.Root size="sm">
        <Skeleton height="40px" mb="2" />
        <Skeleton height="40px" mb="2" />
        <Skeleton height="40px" />
      </Table.Root>
    )
  }

  return (
    <Table.Root size="sm" variant="line" overflowX="auto">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader>Nama Dokter</Table.ColumnHeader>
          <Table.ColumnHeader>Konsultasi (mnt)</Table.ColumnHeader>
          <Table.ColumnHeader>Tersedia Kembali</Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {doctors.length === 0 ? (
          <Table.Row>
            <Table.Cell colSpan={3} textAlign="center" color="gray.500">
              Belum ada dokter
            </Table.Cell>
          </Table.Row>
        ) : (
          doctors.map((d) => (
            <Table.Row key={d.id}>
              <Table.Cell fontWeight="medium">{d.name}</Table.Cell>
              <Table.Cell>{d.avg_consult_time}</Table.Cell>
              <Table.Cell>{formatAvailable(d.available_at)}</Table.Cell>
            </Table.Row>
          ))
        )}
      </Table.Body>
    </Table.Root>
  )
}

export default DoctorsTable
