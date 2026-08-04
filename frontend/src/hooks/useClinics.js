import { useEffect, useState, useCallback } from 'react'
import * as clinicService from '../services/clinicService'

export function useClinics() {
  const [clinics, setClinics] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await clinicService.getClinics()
      setClinics(data)
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { clinics, loading, error, reload: load }
}
