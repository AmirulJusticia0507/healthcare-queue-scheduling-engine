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
import PatientsPage from './pages/PatientsPage'
import ReportsPage from './pages/ReportsPage'
import AuditPage from './pages/AuditPage'
import NotificationsPage from './pages/NotificationsPage'
import AppointmentsPage from './pages/AppointmentsPage'
import UsersPage from './pages/UsersPage'
import ProfilePage from './pages/ProfilePage'
import LoginHistoryPage from './pages/LoginHistoryPage'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/tv" element={<TvPage />} />
      <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/queue" element={<QueuePage />} />
        <Route path="/doctors" element={<DoctorsPage />} />
        <Route path="/patients" element={<PatientsPage />} />
        <Route path="/appointments" element={<AppointmentsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/audit" element={<AuditPage />} />
        <Route path="/login-history" element={<LoginHistoryPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/users" element={<UsersPage />} />
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
