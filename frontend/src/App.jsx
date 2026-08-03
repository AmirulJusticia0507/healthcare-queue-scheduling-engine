import { Routes, Route } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import DashboardPage from './pages/DashboardPage'
import QueuePage from './pages/QueuePage'
import DoctorsPage from './pages/DoctorsPage'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/queue" element={<QueuePage />} />
        <Route path="/doctors" element={<DoctorsPage />} />
      </Route>
    </Routes>
  )
}

export default App
