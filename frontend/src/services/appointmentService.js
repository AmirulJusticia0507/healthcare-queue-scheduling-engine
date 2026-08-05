import axios from 'axios'
const API = '/api'

export async function getAppointments({ doctorId, date, status, page, limit } = {}) {
  const res = await axios.get(`${API}/appointments`, { params: { doctorId, date, status, page, limit } })
  return res.data
}

export async function getAppointmentById(id) {
  const res = await axios.get(`${API}/appointments/${id}`)
  return res.data
}

export async function createAppointment(data) {
  const res = await axios.post(`${API}/appointments`, data)
  return res.data
}

export async function updateAppointmentStatus(id, status) {
  const res = await axios.patch(`${API}/appointments/${id}/status`, { status })
  return res.data
}

export async function cancelAppointment(id) {
  const res = await axios.patch(`${API}/appointments/${id}/cancel`)
  return res.data
}

export async function confirmToQueue(id) {
  const res = await axios.patch(`${API}/appointments/${id}/confirm-to-queue`)
  return res.data
}

export async function deleteAppointment(id) {
  const res = await axios.delete(`${API}/appointments/${id}`)
  return res.data
}
