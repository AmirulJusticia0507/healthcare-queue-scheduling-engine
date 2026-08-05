import axios from 'axios'
const API = '/api'

export async function getDashboardStats(clinicId) {
  const res = await axios.get(`${API}/reports/dashboard`, { params: { clinic: clinicId } })
  return res.data
}
