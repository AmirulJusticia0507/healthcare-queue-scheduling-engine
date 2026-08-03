const STATUS_STYLES = {
  waiting: 'bg-amber-100 text-amber-800 border-amber-200',
  skipped: 'bg-red-100 text-red-700 border-red-200',
  called: 'bg-gray-100 text-gray-700 border-gray-200',
  done: 'bg-emerald-100 text-emerald-700 border-emerald-200',
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${
        STATUS_STYLES[status] || 'bg-gray-100 text-gray-700 border-gray-200'
      }`}
    >
      {status}
    </span>
  )
}

export default StatusBadge
