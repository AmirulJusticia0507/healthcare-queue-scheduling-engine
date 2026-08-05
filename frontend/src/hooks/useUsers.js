import { useCallback, useEffect, useState } from 'react'
import * as userService from '../services/userService'

export function useUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await userService.getAllUsers()
      setUsers(data)
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const create = useCallback(async (data) => {
    await userService.createUser(data)
    await load()
  }, [load])

  const update = useCallback(async (id, data) => {
    await userService.updateUser(id, data)
    await load()
  }, [load])

  const resetPw = useCallback(async (id, pw) => {
    await userService.resetPassword(id, pw)
  }, [])

  const remove = useCallback(async (id) => {
    await userService.deleteUser(id)
    await load()
  }, [load])

  return { users, loading, error, load, create, update, resetPw, remove }
}
