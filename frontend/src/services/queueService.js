import axios from 'axios'

const API = '/api'

export async function getQueue() {
  const res = await axios.get(`${API}/queue`)
  return res.data
}

export async function getHistory(params) {
  const res = await axios.get(`${API}/queue/history`, { params })
  return res.data
}

export async function joinQueue(patientName) {
  const res = await axios.post(`${API}/queue`, { patientName })
  return res.data
}

export async function skipPatient(id) {
  const res = await axios.patch(`${API}/queue/${id}/skip`)
  return res.data
}

export async function recallPatient(id) {
  const res = await axios.patch(`${API}/queue/${id}/recall`)
  return res.data
}
