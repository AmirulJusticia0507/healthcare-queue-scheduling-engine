import axios from 'axios'
const API = '/api'

export async function getAuditLogs({ page, limit, entityType, userId } = {}) {
  const res = await axios.get(`${API}/audit`, { params: { page, limit, entityType, userId } })
  return res.data
}
