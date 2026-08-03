import { useCallback, useEffect, useState } from 'react'
import * as doctorService from '../services/doctorService'

export function useDoctors() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await doctorService.getDoctors()
      setDoctors(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const createDoctor = useCallback(
    async (name, avgConsultTime) => {
      await doctorService.addDoctor(name, avgConsultTime)
      await load()
    },
    [load]
  )

  return { doctors, loading, error, createDoctor }
}
