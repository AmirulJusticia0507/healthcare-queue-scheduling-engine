import {
  Box,
  Container,
  Flex,
  Heading,
  Tabs,
} from '@chakra-ui/react'
import QueuePage from './pages/QueuePage'
import DoctorsPage from './pages/DoctorsPage'

function App() {
  return (
    <Box bg="gray.50" minH="100vh">
      <Box bg="brand.500" px="4" py="3">
        <Container maxW="4xl">
          <Heading size="md" color="white">
            Healthcare Queue Scheduling
          </Heading>
        </Container>
      </Box>

      <Container maxW="4xl" py="6">
        <Tabs.Root
          defaultValue="queue"
          colorPalette="brand"
          variant="enclosed"
          justify="flex-start"
        >
          <Tabs.List mb="4">
            <Tabs.Trigger value="queue">Antrian</Tabs.Trigger>
            <Tabs.Trigger value="doctors">Dokter</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="queue">
            <QueuePage />
          </Tabs.Content>
          <Tabs.Content value="doctors">
            <DoctorsPage />
          </Tabs.Content>
        </Tabs.Root>
      </Container>

      <Flex as="footer" justify="center" py="6" color="gray.400" fontSize="sm">
        Healthcare Queue Scheduling Engine
      </Flex>
    </Box>
  )
}

export default App
