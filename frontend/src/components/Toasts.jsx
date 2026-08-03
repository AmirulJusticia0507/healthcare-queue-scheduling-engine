import { useEffect, useState } from 'react'
import { subscribeToast } from '../lib/toast'

const TYPE_STYLES = {
  success: { border: 'border-emerald-300', title: 'text-emerald-800', bar: 'bg-emerald-500' },
  error: { border: 'border-red-300', title: 'text-red-800', bar: 'bg-red-500' },
}

function Toasts() {
  const [toasts, setToasts] = useState([])

  useEffect(() => subscribeToast(setToasts), [])

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
      {toasts.map((toast) => {
        const styles = TYPE_STYLES[toast.type] || TYPE_STYLES.success
        return (
          <div
            key={toast.id}
            className={`relative bg-white border ${styles.border} rounded-lg shadow-lg overflow-hidden`}
          >
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${styles.bar}`} />
            <div className="px-4 py-3 pl-5">
              <p className={`text-sm font-semibold ${styles.title}`}>{toast.title}</p>
              {toast.description && <p className="text-sm text-gray-600 mt-0.5">{toast.description}</p>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default Toasts
