import { useCallback, useEffect, useState } from 'react'
import * as queueService from '../services/queueService'

export function useHistory({ status, q } = {}) {
  const [data, setData] = useState({ items: [], total: 0, totalPages: 1, page: 1, limit: 20 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(
    async (opts = {}) => {
      setLoading(true)
      setError(null)
      try {
        const page = opts.page ?? data.page
        const limit = opts.limit ?? data.limit
        const result = await queueService.getHistory({ status, q, page, limit })
        setData(result)
      } catch (err) {
        setError(err.response?.data?.error || err.message)
      } finally {
        setLoading(false)
      }
    },
    [status, q, data.page, data.limit]
  )

  const refresh = useCallback(() => load({}), [load])

  useEffect(() => {
    load({})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, q])

  return { ...data, loading, error, reload: refresh, goToPage: (page) => load({ page }) }
}
