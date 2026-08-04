import { useCallback, useEffect, useState } from 'react'
import * as queueService from '../services/queueService'
import { getToken } from '../lib/auth'
import { API_BASE } from '../config'

export function useQueue({ clinicId, live = false } = {}) {
  const [queue, setQueue] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (!clinicId) return
    setLoading(true)
    setError(null)
    try {
      const data = await queueService.getQueue(clinicId)
      setQueue(data)
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    } finally {
      setLoading(false)
    }
  }, [clinicId])

  useEffect(() => {
    load()
  }, [load])

  // SSE: live refresh ketika ada perubahan antrian
  useEffect(() => {
    if (!live) return
    const token = getToken()
    const url = `${API_BASE}/queue/stream${token ? `?token=${encodeURIComponent(token)}` : ''}`
    const source = new EventSource(url)
    source.addEventListener('queue_update', () => load())
    source.onerror = () => {
      // biarkan server reconnect
    }
    return () => {
      source.close()
    }
  }, [live, load])

  const addPatient = useCallback(
    async (patientName) => {
      if (!clinicId) return
      const result = await queueService.joinQueueReturn(patientName, clinicId)
      await load()
      return result
    },
    [load, clinicId]
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
