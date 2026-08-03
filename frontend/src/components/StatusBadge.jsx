import { Badge } from '@chakra-ui/react'

const STATUS_COLOR_PALETTE = {
  waiting: 'orange',
  skipped: 'red',
  called: 'gray',
  done: 'green',
}

function StatusBadge({ status }) {
  return (
    <Badge colorPalette={STATUS_COLOR_PALETTE[status] || 'gray'} variant="subtle">
      {status}
    </Badge>
  )
}

export default StatusBadge
