import { useState } from 'react'
import {
  Box,
  Button,
  Dialog,
  Skeleton,
  Table,
  Text,
} from '@chakra-ui/react'
import StatusBadge from './StatusBadge'

function formatTime(ms) {
  if (!ms) return '-'
  return new Date(ms).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function QueueTable({ queue, loading, onSkip, onRecall }) {
  const [skipTarget, setSkipTarget] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const confirmSkip = async () => {
    if (!skipTarget) return
    setSubmitting(true)
    try {
      await onSkip(skipTarget.id)
      setSkipTarget(null)
    } finally {
      setSubmitting(false)
    }
  }

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
    <>
      <Table.Root size="sm" variant="line" overflowX="auto">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>No</Table.ColumnHeader>
            <Table.ColumnHeader>Nama Pasien</Table.ColumnHeader>
            <Table.ColumnHeader>Status</Table.ColumnHeader>
            <Table.ColumnHeader>Estimasi</Table.ColumnHeader>
            <Table.ColumnHeader>Dokter Ditugaskan</Table.ColumnHeader>
            <Table.ColumnHeader>Aksi</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {queue.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={6} textAlign="center" color="gray.500">
                Antrian kosong
              </Table.Cell>
            </Table.Row>
          ) : (
            queue.map((p, idx) => (
              <Table.Row key={p.id}>
                <Table.Cell>{idx + 1}</Table.Cell>
                <Table.Cell fontWeight="medium">{p.patient_name}</Table.Cell>
                <Table.Cell>
                  <StatusBadge status={p.status} />
                </Table.Cell>
                <Table.Cell>{p.estimatedTime} mnt</Table.Cell>
                <Table.Cell>
                  {p.assignedDoctor ? p.assignedDoctor.name : '-'}
                  {p.assignedDoctor && (
                    <Box as="span" color="gray.500" fontSize="xs">
                      {' '}
                      ({formatTime(p.assignedDoctor.availableAt)})
                    </Box>
                  )}
                </Table.Cell>
                <Table.Cell>
                  {p.status === 'waiting' ? (
                    <Button
                      size="xs"
                      colorPalette="red"
                      variant="outline"
                      onClick={() => setSkipTarget(p)}
                    >
                      Skip
                    </Button>
                  ) : (
                    <Button
                      size="xs"
                      colorPalette="green"
                      variant="outline"
                      onClick={() => onRecall(p.id)}
                    >
                      Recall
                    </Button>
                  )}
                </Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table.Root>

      <Dialog.Root
        open={skipTarget !== null}
        onOpenChange={(details) => {
          if (!details.open) setSkipTarget(null)
        }}
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Skip Pasien?</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Text fontSize="sm">
                Pasien <strong>{skipTarget?.patient_name}</strong> akan dilewati
                sementara dan dokter yang ditugaskan akan dibebaskan.
              </Text>
            </Dialog.Body>
            <Dialog.Footer>
              <Button
                variant="outline"
                onClick={() => setSkipTarget(null)}
                disabled={submitting}
              >
                Batal
              </Button>
              <Button colorPalette="red" onClick={confirmSkip} loading={submitting}>
                Ya, Skip
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </>
  )
}

export default QueueTable
