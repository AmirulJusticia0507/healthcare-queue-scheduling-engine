import { useCallback, useEffect, useState } from 'react'
import * as doctorService from '../services/doctorService'

export function useDoctors(clinicId) {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await doctorService.getDoctors(clinicId)
      setDoctors(data)
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    } finally {
      setLoading(false)
    }
  }, [clinicId])

  useEffect(() => {
    load()
  }, [load])

  const createDoctor = useCallback(
    async (name, avgConsultTime) => {
      await doctorService.addDoctor(name, avgConsultTime, clinicId)
      await load()
    },
    [load]
  )

  return { doctors, loading, error, createDoctor }
}
