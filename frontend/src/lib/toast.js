let listeners = []
let toasts = []
let nextId = 0

function emit() {
  listeners.forEach((listener) => listener([...toasts]))
}

export function pushToast({ title, description, type = 'success' }) {
  const toast = { id: ++nextId, title, description, type }
  toasts = [...toasts, toast]
  emit()
  window.setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== toast.id)
    emit()
  }, 4000)
}

export function subscribeToast(listener) {
  listeners.push(listener)
  return () => {
    listeners = listeners.filter((l) => l !== listener)
  }
}
