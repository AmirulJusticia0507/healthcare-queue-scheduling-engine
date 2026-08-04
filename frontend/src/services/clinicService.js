import axios from 'axios'
import { API_BASE } from '../config'

const API = API_BASE

export async function getClinics() {
  const res = await axios.get(`${API}/clinics`)
  return res.data
}
