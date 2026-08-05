import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  MapPin,
  FileText,
  Users,
  Settings,
  Building2,
  X,
  ChevronLeft,
  PieChart,
} from 'lucide-react'
import { useState } from 'react'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

const navItems = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Bildirimler', path: '/reports', icon: FileText, badge: 12 },
  { label: 'Analiz & Raporlar', path: '/analytics', icon: PieChart },
  { label: 'Harita', path: '/map', icon: MapPin },
  { label: 'Kullanıcılar', path: '/users', icon: Users },
  { label: 'Ayarlar', path: '/profile', icon: Settings },
]

export default function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <>
      {/* Mobil overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col
          bg-gradient-to-b from-primary-950 via-primary-900 to-primary-950
          shadow-[var(--shadow-sidebar)]
          transition-all duration-300 ease-in-out
          ${collapsed ? 'lg:w-20' : 'lg:w-64'}
          ${open ? 'w-64 translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* ── Üst kısım — Logo ── */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center shrink-0 w-9 h-9 rounded-lg bg-white/10 backdrop-blur-sm border border-white/15">
              <Building2 className="w-5 h-5 text-accent-400" />
            </div>
            {!collapsed && (
              <span className="text-base font-bold text-white tracking-tight truncate">
                Civic Reporter
              </span>
            )}
          </div>

          {/* Mobil kapat butonu */}
          <button
            onClick={onClose}
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg text-primary-300 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Menüyü kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Navigasyon ── */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`
                  group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium
                  transition-all duration-[var(--transition-base)]
                  ${
                    isActive
                      ? 'bg-white/15 text-white shadow-sm'
                      : 'text-primary-200 hover:bg-white/8 hover:text-white'
                  }
                  ${collapsed ? 'lg:justify-center lg:px-0' : ''}
                `}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={`shrink-0 w-5 h-5 transition-colors ${
                    isActive ? 'text-accent-400' : 'text-primary-300 group-hover:text-accent-300'
                  }`}
                />
                {!collapsed && (
                  <>
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto inline-flex items-center justify-center min-w-[1.25rem] h-5 rounded-full bg-accent-500 px-1.5 text-[0.65rem] font-bold text-white">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* ── Alt kısım — Daralt butonu ── */}
        <div className="hidden lg:flex items-center justify-center border-t border-white/10 py-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-primary-300 hover:text-white hover:bg-white/10 transition-colors"
            aria-label={collapsed ? 'Menüyü genişlet' : 'Menüyü daralt'}
          >
            <ChevronLeft
              className={`w-5 h-5 transition-transform duration-300 ${
                collapsed ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>
      </aside>
    </>
  )
}
