import { useCallback, useEffect, useState } from 'react'
import * as queueService from '../services/queueService'

export function useQueue() {
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
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

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
