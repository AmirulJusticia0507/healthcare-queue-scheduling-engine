import { createContext, useContext, useState } from 'react'
import { getClinicId, setClinicId } from '../lib/clinic'
import { useClinics } from '../hooks/useClinics'

const ClinicContext = createContext(null)

export function useClinic() {
  return useContext(ClinicContext)
}

export function ClinicProvider({ children }) {
  const { clinics, loading, error, reload } = useClinics()
  const [clinicId, setClinicIdState] = useState(() => getClinicId())

  const switchClinic = (id) => {
    setClinicIdState(id)
    setClinicId(id)
  }

  return (
    <ClinicContext.Provider value={{ clinicId, switchClinic, clinics, loading, error, reloadClinics: reload }}>
      {children}
    </ClinicContext.Provider>
  )
}
