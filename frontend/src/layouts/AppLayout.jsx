import {
  Box,
  Container,
  Flex,
  Heading,
  Link as ChakraLink,
  Text,
} from '@chakra-ui/react'
import { Link as RouterLink, Outlet, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard' },
  { path: '/queue', label: 'Antrian' },
  { path: '/doctors', label: 'Dokter' },
]

function Navbar() {
  return (
    <Box bg="brand.600" px="4" py="3" shadow="sm">
      <Container maxW="6xl" display="flex" alignItems="center" gap="3">
        <Box
          bg="white"
          color="brand.600"
          borderRadius="md"
          px="2"
          py="1"
          fontWeight="bold"
          fontSize="sm"
        >
          HQ
        </Box>
        <Box>
          <Heading size="sm" color="white" lineHeight="1.2">
            Healthcare Queue
          </Heading>
          <Text fontSize="xs" color="whiteAlpha.800">
            Sistem Antrian Rumah Sakit
          </Text>
        </Box>
      </Container>
    </Box>
  )
}

function Sidebar() {
  const location = useLocation()

  return (
    <Box
      as="nav"
      w={{ base: '100%', md: '220px' }}
      flexShrink={0}
      bg="white"
      borderRight={{ base: 'none', md: '1px solid' }}
      borderBottom={{ base: '1px solid', md: 'none' }}
      borderColor="gray.200"
      p="3"
      display={{ base: 'flex', md: 'block' }}
      gap="1"
      flexWrap="wrap"
    >
      {NAV_ITEMS.map((item) => {
        const active =
          item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)

        return (
          <ChakraLink
            key={item.path}
            as={RouterLink}
            to={item.path}
            display="block"
            px="3"
            py="2"
            borderRadius="md"
            fontWeight="medium"
            fontSize="sm"
            bg={active ? 'brand.50' : 'transparent'}
            color={active ? 'brand.700' : 'gray.600'}
            borderLeft={active ? '3px solid' : '3px solid transparent'}
            borderColor={active ? 'brand.500' : 'transparent'}
            _hover={{ bg: 'brand.50', color: 'brand.700', textDecoration: 'none' }}
          >
            {item.label}
          </ChakraLink>
        )
      })}
    </Box>
  )
}

function Footer() {
  return (
    <Box
      as="footer"
      bg="white"
      borderTop="1px solid"
      borderColor="gray.200"
      py="4"
      textAlign="center"
    >
      <Text fontSize="sm" color="gray.500">
        © 2026 Healthcare Queue Scheduling Engine
      </Text>
    </Box>
  )
}

function AppLayout() {
  return (
    <Flex minH="100vh" direction="column" bg="gray.50">
      <Navbar />
      <Container maxW="6xl" display="flex" flex="1" p="0" flexDirection={{ base: 'column', md: 'row' }}>
        <Sidebar />
        <Box flex="1" p={{ base: 4, md: 6 }} minW="0">
          <Outlet />
        </Box>
      </Container>
      <Footer />
    </Flex>
  )
}

export default AppLayout
