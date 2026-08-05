import { useCallback, useEffect, useState } from 'react'
import * as reportService from '../services/reportService'

export function useReports(clinicId) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (!clinicId) return
    setLoading(true)
    setError(null)
    try {
      const data = await reportService.getDashboardStats(clinicId)
      setStats(data)
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    } finally {
      setLoading(false)
    }
  }, [clinicId])

  useEffect(() => { load() }, [load])

  return { stats, loading, error, reload: load }
}
