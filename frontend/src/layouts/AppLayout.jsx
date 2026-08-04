import { Link as RouterLink, Outlet, useLocation } from 'react-router-dom'
import Toasts from '../components/Toasts'
import { useAuth } from '../contexts/AuthContext'

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard' },
  { path: '/queue', label: 'Antrian' },
  { path: '/doctors', label: 'Dokter' },
]

function Navbar() {
  const { user, logout } = useAuth()
  return (
    <header className="bg-brand-600 text-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-white text-brand-600 rounded-md px-2 py-1 font-bold text-sm">HQ</div>
          <div>
            <p className="font-semibold text-sm leading-tight">Healthcare Queue</p>
            <p className="text-xs text-blue-100">Sistem Antrian Rumah Sakit</p>
          </div>
        </div>
        {user && (
          <div className="flex items-center gap-2 text-sm">
            <span className="hidden sm:inline">{user.name || user.email}</span>
            <button
              type="button"
              onClick={logout}
              className="px-2.5 py-1 text-xs font-medium rounded-md border border-white/30 hover:bg-white/10"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

function Sidebar() {
  const location = useLocation()

  return (
    <nav className="w-full md:w-56 md:shrink-0 bg-white border-b md:border-b-0 md:border-r border-gray-200 p-3 flex md:flex-col gap-1 flex-wrap">
      {NAV_ITEMS.map((item) => {
        const active =
          item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)
        return (
          <RouterLink
            key={item.path}
            to={item.path}
            className={`px-3 py-2 rounded-md text-sm font-medium border-l-[3px] ${
              active
                ? 'bg-brand-50 text-brand-700 border-brand-500'
                : 'text-gray-600 border-transparent hover:bg-brand-50 hover:text-brand-700'
            }`}
          >
            {item.label}
          </RouterLink>
        )
      })}
    </nav>
  )
}

function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-4 text-center text-sm text-gray-500">
      © 2026 Healthcare Queue Scheduling Engine
    </footer>
  )
}

function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Toasts />
      <Navbar />
      <div className="max-w-6xl w-full mx-auto flex-1 flex flex-col md:flex-row">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 min-w-0">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  )
}

export default AppLayout
