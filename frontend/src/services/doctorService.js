import axios from 'axios'

const API = '/api'

export async function getDoctors(clinicId) {
  const res = await axios.get(`${API}/doctors`, { params: { clinic: clinicId } })
  return res.data
}

export async function addDoctor(name, avgConsultTime, clinicId) {
  const res = await axios.post(`${API}/doctors`, { name, avgConsultTime, clinic_id: clinicId })
  return res.data
}

export async function updateDoctor(id, data) {
  const res = await axios.put(`${API}/doctors/${id}`, data)
  return res.data
}

export async function deleteDoctor(id) {
  const res = await axios.delete(`${API}/doctors/${id}`)
  return res.data
}
