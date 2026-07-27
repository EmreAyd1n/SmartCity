import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUpRight,
  Plus
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { StatCard } from '../types'

/* ── Mock istatistik verileri ── */
const stats: StatCard[] = [
  {
    label: 'Toplam Bildirim',
    value: 1_284,
    change: 12.5,
    trend: 'up',
    icon: 'file',
  },
  {
    label: 'Bekleyen',
    value: 47,
    change: -8.2,
    trend: 'down',
    icon: 'clock',
  },
  {
    label: 'Çözülen',
    value: 1_189,
    change: 15.3,
    trend: 'up',
    icon: 'check',
  },
  {
    label: 'Kritik',
    value: 12,
    change: 0,
    trend: 'neutral',
    icon: 'alert',
  },
]

const iconMap: Record<string, React.ReactNode> = {
  file: <FileText className="w-6 h-6" />,
  clock: <Clock className="w-6 h-6" />,
  check: <CheckCircle2 className="w-6 h-6" />,
  alert: <AlertTriangle className="w-6 h-6" />,
}

const trendIcon: Record<string, React.ReactNode> = {
  up: <TrendingUp className="w-4 h-4" />,
  down: <TrendingDown className="w-4 h-4" />,
  neutral: <Minus className="w-4 h-4" />,
}

const trendColor: Record<string, string> = {
  up: 'text-accent-600 bg-accent-50',
  down: 'text-danger-600 bg-red-50',
  neutral: 'text-surface-500 bg-surface-100',
}

const cardAccent: Record<string, string> = {
  file: 'from-primary-500 to-primary-600',
  clock: 'from-warning-500 to-warning-600',
  check: 'from-accent-500 to-accent-600',
  alert: 'from-danger-500 to-danger-600',
}

/* ── Son bildirimler (mock) ── */
const recentReports = [
  {
    id: '1',
    title: 'Atatürk Caddesi çukur',
    category: 'Altyapı',
    status: 'pending' as const,
    time: '2 dk önce',
  },
  {
    id: '2',
    title: 'Park aydınlatması arızalı',
    category: 'Aydınlatma',
    status: 'in_progress' as const,
    time: '15 dk önce',
  },
  {
    id: '3',
    title: 'Çöp konteyneri taşmış',
    category: 'Çevre',
    status: 'resolved' as const,
    time: '1 saat önce',
  },
  {
    id: '4',
    title: 'Trafik ışığı çalışmıyor',
    category: 'Trafik',
    status: 'in_progress' as const,
    time: '2 saat önce',
  },
  {
    id: '5',
    title: 'Su borusu patlaması',
    category: 'Su / Kanalizasyon',
    status: 'pending' as const,
    time: '3 saat önce',
  },
]

const statusBadge: Record<string, { label: string; cls: string }> = {
  pending: {
    label: 'Bekliyor',
    cls: 'bg-warning-500/10 text-warning-600 border border-warning-500/20',
  },
  in_progress: {
    label: 'İşlemde',
    cls: 'bg-info-500/10 text-info-600 border border-info-500/20',
  },
  resolved: {
    label: 'Çözüldü',
    cls: 'bg-accent-500/10 text-accent-600 border border-accent-500/20',
  },
  rejected: {
    label: 'Reddedildi',
    cls: 'bg-danger-500/10 text-danger-600 border border-danger-500/20',
  },
}

export default function DashboardPage() {
  const { profile } = useAuth();
  
  return (
    <div className="space-y-8">
      {/* ── Başlık ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-surface-500 text-sm mt-1">
            Bildirim ve operasyon durumuna genel bakış
          </p>
        </div>
        
        {profile?.role === 'citizen' && (
          <Link
            to="/create-issue"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Yeni Sorun Bildir
          </Link>
        )}
      </div>

      {/* ── İstatistik Kartları ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="group relative glass-card p-5 overflow-hidden transition-shadow duration-200 hover:shadow-[var(--shadow-card-lg)]"
          >
            {/* Sol üst dekoratif şerit */}
            <div
              className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${cardAccent[stat.icon ?? 'file']} rounded-l-[var(--radius-card)]`}
            />

            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-surface-500 uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className="mt-2 text-3xl font-extrabold text-surface-900 tabular-nums">
                  {typeof stat.value === 'number'
                    ? stat.value.toLocaleString('tr-TR')
                    : stat.value}
                </p>
              </div>
              <div className={`flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br ${cardAccent[stat.icon ?? 'file']} text-white shadow-md`}>
                {iconMap[stat.icon ?? 'file']}
              </div>
            </div>

            {/* Trend */}
            {stat.trend && (
              <div className="mt-3 flex items-center gap-1.5">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${trendColor[stat.trend]}`}
                >
                  {trendIcon[stat.trend]}
                  {stat.change !== undefined
                    ? `${Math.abs(stat.change)}%`
                    : '—'}
                </span>
                <span className="text-xs text-surface-400">
                  geçen aya göre
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Son Bildirimler ── */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200">
          <h2 className="text-lg font-semibold text-surface-900">
            Son Bildirimler
          </h2>
          <button className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
            Tümünü Gör
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="divide-y divide-surface-100">
          {recentReports.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between px-6 py-4 hover:bg-surface-50/70 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="shrink-0 w-2 h-2 rounded-full bg-primary-500" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-surface-800 truncate">
                    {r.title}
                  </p>
                  <p className="text-xs text-surface-400 mt-0.5">
                    {r.category}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusBadge[r.status].cls}`}
                >
                  {statusBadge[r.status].label}
                </span>
                <span className="text-xs text-surface-400 w-20 text-right">
                  {r.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
