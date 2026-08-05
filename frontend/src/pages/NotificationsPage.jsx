import { useCallback, useEffect, useState } from 'react'
import * as notifService from '../services/notificationService'
import { pushToast } from '../lib/toast'

const btn = 'inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors disabled:opacity-50'

function NotificationsPage() {
  const [notifs, setNotifs] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await notifService.getNotifications({ page, limit: 20, unreadOnly: showUnreadOnly })
      setNotifs(data.items || [])
      setTotal(data.total || 0)
      setUnreadCount(data.unreadCount || 0)
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    } finally {
      setLoading(false)
    }
  }, [page, showUnreadOnly])

  useEffect(() => { load() }, [load])

  async function handleMarkRead(id) {
    await notifService.markAsRead(id)
    load()
  }

  async function handleMarkAllRead() {
    await notifService.markAllAsRead()
    pushToast({ title: 'Selesai', description: 'Semua notifikasi ditandai sudah dibaca', type: 'success' })
    load()
  }

  async function handleDelete(id) {
    await notifService.deleteNotification(id)
    load()
  }

  const totalPages = Math.max(1, Math.ceil(total / 20))
  const typeColors = { info: 'bg-blue-100 text-blue-800', success: 'bg-green-100 text-green-800', warning: 'bg-amber-100 text-amber-800', error: 'bg-red-100 text-red-800' }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold">Notifikasi</h1>
          {unreadCount > 0 && <span className="px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">{unreadCount}</span>}
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowUnreadOnly(!showUnreadOnly)} className={`${btn} border-gray-300 text-gray-700 hover:bg-gray-100`}>
            {showUnreadOnly ? 'Semua' : 'Belum Dibaca'}
          </button>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} className={`${btn} border-green-300 bg-green-600 text-white hover:bg-green-700`}>Tandai Semua Dibaca</button>
          )}
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-3 py-2">{error}</div>}

      <div className="space-y-2">
        {loading ? (
          [1, 2, 3].map(n => <div key={n} className="bg-white rounded-lg border border-gray-200 p-4"><div className="h-4 bg-gray-200 animate-pulse rounded w-3/4" /></div>)
        ) : notifs.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-gray-500 text-sm">Tidak ada notifikasi</div>
        ) : (
          notifs.map(n => (
            <div key={n.id} className={`bg-white rounded-lg border p-4 flex items-start gap-3 ${n.is_read ? 'border-gray-200' : 'border-blue-300 bg-blue-50'}`}>
              <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${typeColors[n.type] || typeColors.info}`}>
                {(n.type || 'info').toUpperCase()}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{n.title}</p>
                <p className="text-xs text-gray-600 mt-1">{n.message}</p>
                <p className="text-[10px] text-gray-400 mt-1">{new Date(n.created_at).toLocaleString('id-ID')}</p>
              </div>
              <div className="flex gap-1">
                {!n.is_read && (
                  <button onClick={() => handleMarkRead(n.id)} className="text-[10px] font-semibold text-blue-600 hover:text-blue-800">Baca</button>
                )}
                <button onClick={() => handleDelete(n.id)} className="text-[10px] font-semibold text-red-600 hover:text-red-800">Hapus</button>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-1">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className={`${btn} border-gray-300 text-gray-700 hover:bg-gray-100`}>Sebelumnya</button>
          <span className="px-3 py-1 text-xs text-gray-500">{page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className={`${btn} border-gray-300 text-gray-700 hover:bg-gray-100`}>Berikutnya</button>
        </div>
      )}
    </div>
  )
}

export default NotificationsPage
