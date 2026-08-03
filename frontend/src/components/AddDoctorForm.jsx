import { useState } from 'react'
import {
  Box,
  Button,
  Field,
  Input,
  NumberInput,
  VStack,
} from '@chakra-ui/react'

function AddDoctorForm({ onSubmit, loading }) {
  const [name, setName] = useState('')
  const [avgConsultTime, setAvgConsultTime] = useState('15')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    await onSubmit(name.trim(), Number(avgConsultTime))
    setName('')
    setAvgConsultTime('15')
  }

  return (
    <Box as="form" onSubmit={handleSubmit} p="4" borderWidth="1px" borderRadius="md">
      <VStack spacing="3" align="stretch">
        <Field.Root required>
          <Field.Label fontSize="sm">Nama Dokter</Field.Label>
          <Input
            size="sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Dr. Budi"
          />
        </Field.Root>
        <Field.Root required>
          <Field.Label fontSize="sm">Konsultasi (menit)</Field.Label>
          <NumberInput.Root
            size="sm"
            min={1}
            value={avgConsultTime}
            onValueChange={(details) => setAvgConsultTime(details.value)}
          >
            <NumberInput.Input />
            <NumberInput.Control>
              <NumberInput.IncrementTrigger />
              <NumberInput.DecrementTrigger />
            </NumberInput.Control>
          </NumberInput.Root>
        </Field.Root>
        <Button type="submit" colorPalette="brand" size="sm" loading={loading}>
          Tambah Dokter
        </Button>
      </VStack>
    </Box>
  )
}

export default AddDoctorForm
