export const CLINIC_KEY = 'hq_clinic'

export function getClinicId() {
  if (typeof window === 'undefined') return 1
  const v = localStorage.getItem(CLINIC_KEY)
  const n = Number(v)
  return n > 0 ? n : 1
}

export function setClinicId(id) {
  localStorage.setItem(CLINIC_KEY, String(id))
}
