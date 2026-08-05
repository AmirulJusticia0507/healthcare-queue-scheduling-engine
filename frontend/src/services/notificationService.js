import axios from 'axios'
const API = '/api'

export async function getNotifications({ page, limit, unreadOnly } = {}) {
  const res = await axios.get(`${API}/notifications`, { params: { page, limit, unreadOnly } })
  return res.data
}

export async function markAsRead(id) {
  const res = await axios.patch(`${API}/notifications/${id}/read`)
  return res.data
}

export async function markAllAsRead() {
  const res = await axios.patch(`${API}/notifications/read-all`)
  return res.data
}

export async function deleteNotification(id) {
  const res = await axios.delete(`${API}/notifications/${id}`)
  return res.data
}
