import axios from 'axios'
const API = '/api/auth'

export async function getAllUsers() {
  const res = await axios.get(`${API}/users`)
  return res.data
}

export async function getUserById(id) {
  const res = await axios.get(`${API}/users/${id}`)
  return res.data
}

export async function createUser(data) {
  const res = await axios.post(`${API}/users`, data)
  return res.data
}

export async function updateUser(id, data) {
  const res = await axios.put(`${API}/users/${id}`, data)
  return res.data
}

export async function resetPassword(id, newPassword) {
  const res = await axios.post(`${API}/users/${id}/reset-password`, { newPassword })
  return res.data
}

export async function deleteUser(id) {
  const res = await axios.delete(`${API}/users/${id}`)
  return res.data
}

export async function updateProfile(data) {
  const res = await axios.patch(`${API}/profile`, data)
  return res.data
}

export async function changePassword(data) {
  const res = await axios.post(`${API}/change-password`, data)
  return res.data
}

export async function getLoginLogs({ page, limit, userId } = {}) {
  const res = await axios.get(`${API}/login-logs`, { params: { page, limit, userId } })
  return res.data
}
