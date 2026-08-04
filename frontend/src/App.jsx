import { Routes, Route } from 'react-router-dom'
import { ClinicProvider } from './contexts/ClinicContext'
import { AuthProvider } from './contexts/AuthContext'
import RequireAuth from './components/RequireAuth'
import AppLayout from './layouts/AppLayout'
import LoginPage from './pages/LoginPage'
import TvPage from './pages/TvPage'
import DashboardPage from './pages/DashboardPage'
import QueuePage from './pages/QueuePage'
import HistoryPage from './pages/HistoryPage'
import DoctorsPage from './pages/DoctorsPage'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/tv" element={<TvPage />} />
      <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/queue" element={<QueuePage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/doctors" element={<DoctorsPage />} />
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <ClinicProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ClinicProvider>
  )
}

export default App
