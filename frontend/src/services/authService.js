import axios from 'axios'
import { getToken, clearToken } from '../lib/auth'
import { API_BASE } from '../config'

const API = API_BASE

export async function login(email, password, captchaToken) {
  const res = await axios.post(`${API}/auth/login`, { email, password, captchaToken })
  return res.data
}

export async function fetchMe() {
  const res = await axios.get(`${API}/auth/me`)
  return res.data
}

axios.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

axios.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      clearToken()
      window.dispatchEvent(new Event('auth:logout'))
    }
    return Promise.reject(err)
  }
)
