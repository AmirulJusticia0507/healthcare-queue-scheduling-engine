import axios from 'axios'
import { API_BASE } from '../config'

const API = API_BASE

export async function getDnaPatient(externalId) {
  const res = await axios.get(`${API}/dna/patient/${encodeURIComponent(externalId)}`)
  return res.data
}