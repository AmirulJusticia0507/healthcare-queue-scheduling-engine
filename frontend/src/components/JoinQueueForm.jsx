import { useState } from 'react'
import { Box, Button, Field, Input, VStack } from '@chakra-ui/react'

function JoinQueueForm({ onSubmit, loading }) {
  const [patientName, setPatientName] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!patientName.trim()) return
    await onSubmit(patientName.trim())
    setPatientName('')
  }

  return (
    <Box as="form" onSubmit={handleSubmit} p="4" borderWidth="1px" borderRadius="md">
      <VStack spacing="3" align="stretch">
        <Field.Root required>
          <Field.Label fontSize="sm">Nama Pasien</Field.Label>
          <Input
            size="sm"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            placeholder="Nama pasien"
          />
        </Field.Root>
        <Button type="submit" colorPalette="brand" size="sm" loading={loading}>
          Masuk Antrian
        </Button>
      </VStack>
    </Box>
  )
}

export default JoinQueueForm
