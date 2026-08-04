import { useCallback, useEffect, useState } from 'react'
import * as queueService from '../services/queueService'
import { getToken } from '../lib/auth'

export function useQueue({ live = false } = {}) {
  const [queue, setQueue] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await queueService.getQueue()
      setQueue(data)
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // SSE: live refresh ketika ada perubahan antrian
  useEffect(() => {
    if (!live) return
    const token = getToken()
    if (!token) return
    const url = `/api/queue/stream?token=${encodeURIComponent(token)}`
    const source = new EventSource(url)
    source.addEventListener('queue_update', () => load())
    source.onerror = () => {
      // biarkan server reconnect; tidak paksa refresh di sini
    }
    return () => {
      source.close()
    }
  }, [live, load])

  const addPatient = useCallback(
    async (patientName) => {
      await queueService.joinQueue(patientName)
      await load()
    },
    [load]
  )

  const skip = useCallback(
    async (id) => {
      await queueService.skipPatient(id)
      await load()
    },
    [load]
  )

  const recall = useCallback(
    async (id) => {
      await queueService.recallPatient(id)
      await load()
    },
    [load]
  )

  return { queue, loading, error, addPatient, skip, recall, reload: load }
}
