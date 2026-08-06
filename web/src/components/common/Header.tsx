import {
  Menu,
  Bell,
  Search,
  ChevronDown,
  User,
  Sun,
  Moon,
} from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

interface HeaderProps {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 lg:px-8 bg-white/80 dark:bg-surface-900/80 backdrop-blur-md border-b border-surface-200 dark:border-surface-700 transition-colors duration-200">
      {/* Sol — Hamburger + Arama */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg text-surface-500 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800 transition-colors duration-200"
          aria-label="Menüyü aç"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center relative">
          <Search className="absolute left-3 w-4 h-4 text-surface-400 pointer-events-none" />
          <input
            type="search"
            placeholder="Bildirim ara..."
            className="w-64 rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 py-2 pl-9 pr-4 text-sm text-surface-700 dark:text-surface-100 placeholder:text-surface-400 outline-none transition-all duration-[var(--transition-base)] focus:border-primary-400 focus:ring-2 focus:ring-primary-500/15 focus:w-80"
          />
        </div>
      </div>

      {/* Sağ — Bildirimler + Kullanıcı */}
      <div className="flex items-center gap-3">
        {/* Tema Değiştirme Butonu */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center w-9 h-9 rounded-lg text-surface-500 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800 transition-colors duration-200"
          aria-label="Temayı değiştir"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>

        {/* Bildirim zili */}
        <button
          className="relative flex items-center justify-center w-9 h-9 rounded-lg text-surface-500 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800 transition-colors duration-200"
          aria-label="Bildirimler"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-danger-500 ring-2 ring-white dark:ring-surface-900" />
        </button>

        {/* Kullanıcı menüsü */}
        <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors duration-200">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 text-white">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-surface-800 dark:text-surface-100 leading-tight">
              Admin
            </p>
            <p className="text-xs text-surface-400 dark:text-surface-500 leading-tight">
              Yönetici
            </p>
          </div>
          <ChevronDown className="hidden md:block w-4 h-4 text-surface-400" />
        </button>
      </div>
    </header>
  )
}
