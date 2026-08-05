import { useCallback, useEffect, useState } from 'react'
import * as patientService from '../services/patientService'

export function usePatients({ page = 1, limit = 10, q = '' } = {}) {
  const [patients, setPatients] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await patientService.getPatients({ page, limit, q })
      setPatients(data.patients || data)
      setTotal(data.total || (data.patients || data).length)
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    } finally {
      setLoading(false)
    }
  }, [page, limit, q])

  useEffect(() => {
    load()
  }, [load])

  const create = useCallback(
    async (data) => {
      await patientService.createPatient(data)
      await load()
    },
    [load]
  )

  const update = useCallback(
    async (id, data) => {
      await patientService.updatePatient(id, data)
      await load()
    },
    [load]
  )

  const remove = useCallback(
    async (id) => {
      await patientService.deletePatient(id)
      await load()
    },
    [load]
  )

  return { patients, total, loading, error, load, create, update, remove }
}
