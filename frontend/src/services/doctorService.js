import axios from 'axios'

const API = '/api'

export async function getDoctors() {
  const res = await axios.get(`${API}/doctors`)
  return res.data
}

export async function addDoctor(name, avgConsultTime) {
  const res = await axios.post(`${API}/doctors`, { name, avgConsultTime })
  return res.data
}
