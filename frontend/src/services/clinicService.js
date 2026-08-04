import axios from 'axios'
const API = '/api'

export async function getClinics() {
  const res = await axios.get(`${API}/clinics`)
  return res.data
}
