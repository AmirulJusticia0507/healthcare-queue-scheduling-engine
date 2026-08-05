import axios from 'axios'

const API = '/api'

export async function getPatients({ page, limit, q } = {}) {
  const res = await axios.get(`${API}/patients`, { params: { page, limit, q } })
  return res.data
}

export async function getPatientById(id) {
  const res = await axios.get(`${API}/patients/${id}`)
  return res.data
}

export async function getPatientByExternalId(externalId) {
  const res = await axios.get(`${API}/patients/external/${externalId}`)
  return res.data
}

export async function createPatient(data) {
  const res = await axios.post(`${API}/patients`, data)
  return res.data
}

export async function updatePatient(id, data) {
  const res = await axios.put(`${API}/patients/${id}`, data)
  return res.data
}

export async function deletePatient(id) {
  const res = await axios.delete(`${API}/patients/${id}`)
  return res.data
}

export async function getPatientHistory(id) {
  const res = await axios.get(`${API}/patients/${id}/history`)
  return res.data
}
