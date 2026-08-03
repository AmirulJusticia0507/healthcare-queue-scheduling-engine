import { createSystem, defineConfig } from '@chakra-ui/react'

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: '#eff6ff' },
          100: { value: '#dbeafe' },
          500: { value: '#2563eb' },
          600: { value: '#1d4ed8' },
          700: { value: '#1e40af' },
        },
        secondary: {
          500: { value: '#0ea5e9' },
        },
      },
    },
  },
})

const system = createSystem(config)

export default system
