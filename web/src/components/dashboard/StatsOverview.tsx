import React, { useEffect, useState, useCallback } from 'react'
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
} from 'lucide-react'
import { getDashboardStats, type DashboardStats } from '../../services/reports'
import type { UserRole } from '../../types'

interface StatsOverviewProps {
  /** Aktif kullanıcı rolü — Kartların vurgusu buna göre şekillenir */
  role: UserRole
  /** Dışarıdan tetiklenen yenileme sayacı (rapor ekleme/güncelleme sonrası artırılır) */
  refreshKey?: number
}

interface MetricCardConfig {
  key: string
  label: string
  labelOfficial: string
  icon: React.ReactNode
  accent: string
  accentBg: string
  getValue: (s: DashboardStats) => number | string
  suffix?: string
}

const CARDS: MetricCardConfig[] = [
  {
    key: 'total',
    label: 'Bildirimlerim',
    labelOfficial: 'Toplam Bildirim',
    icon: <FileText className="w-6 h-6" />,
    accent: 'from-primary-500 to-primary-600',
    accentBg: 'bg-primary-500/10 text-primary-600',
    getValue: (s) => s.total,
  },
  {
    key: 'pending',
    label: 'Bekleyen',
    labelOfficial: 'Bekleyen Sorunlar',
    icon: <Clock className="w-6 h-6" />,
    accent: 'from-warning-500 to-warning-600',
    accentBg: 'bg-warning-500/10 text-warning-600',
    getValue: (s) => s.pending,
  },
  {
    key: 'resolved',
    label: 'Çözülen',
    labelOfficial: 'Çözülen Sorunlar',
    icon: <CheckCircle2 className="w-6 h-6" />,
    accent: 'from-accent-500 to-accent-600',
    accentBg: 'bg-accent-500/10 text-accent-600',
    getValue: (s) => s.resolved,
  },
  {
    key: 'critical',
    label: 'Acil Durumlar',
    labelOfficial: 'Kritik Seviye',
    icon: <AlertTriangle className="w-6 h-6" />,
    accent: 'from-danger-500 to-danger-600',
    accentBg: 'bg-danger-500/10 text-danger-600',
    getValue: (s) => s.urgent + s.high,
  },
]

export default function StatsOverview({ role, refreshKey = 0 }: StatsOverviewProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isOfficial = role === 'official' || role === 'admin'

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getDashboardStats()
      setStats(data)
    } catch (err: any) {
      setError(err.message || 'İstatistikler yüklenemedi.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats, refreshKey])

  // Loading Skeleton
  if (loading && !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="glass-card p-5 animate-pulse"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-3 flex-1">
                <div className="h-3 w-24 bg-surface-200 rounded" />
                <div className="h-8 w-16 bg-surface-200 rounded" />
              </div>
              <div className="w-11 h-11 bg-surface-200 rounded-xl" />
            </div>
            <div className="mt-4 h-3 w-32 bg-surface-100 rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass-card p-6 text-center text-danger-600">
        <AlertTriangle className="w-6 h-6 mx-auto mb-2" />
        <p className="text-sm font-medium">{error}</p>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="space-y-4">
      {/* Bölüm Başlığı — Rol bazlı */}
      <div className="flex items-center gap-3">
        <div className={`flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br ${isOfficial ? 'from-primary-500 to-primary-600' : 'from-accent-500 to-accent-600'} text-white shadow-md`}>
          {isOfficial ? <BarChart3 className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-surface-900 tracking-tight">
            {isOfficial ? 'Şehir Genel Durumu' : 'Bildirimlerim ve Şehir Özeti'}
          </h2>
          <p className="text-xs text-surface-500">
            {isOfficial
              ? 'Tüm bildirimlerin anlık özeti'
              : 'Gönderdiğiniz bildirimlerin durumu'}
          </p>
        </div>
      </div>

      {/* Metrik Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {CARDS.map((card, idx) => {
          const value = card.getValue(stats)

          return (
            <div
              key={card.key}
              className="group relative glass-card p-5 overflow-hidden transition-all duration-300 hover:shadow-[var(--shadow-card-lg)] hover:-translate-y-0.5"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              {/* Sol üst dekoratif şerit */}
              <div
                className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${card.accent} rounded-l-[var(--radius-card)] transition-all duration-300 group-hover:w-1.5`}
              />

              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-surface-500 uppercase tracking-wider">
                    {isOfficial ? card.labelOfficial : card.label}
                  </p>
                  <p className="mt-2 text-3xl font-extrabold text-surface-900 tabular-nums">
                    {typeof value === 'number' ? value.toLocaleString('tr-TR') : value}
                    {card.suffix && (
                      <span className="text-lg font-semibold text-surface-400 ml-0.5">
                        {card.suffix}
                      </span>
                    )}
                  </p>
                </div>
                <div
                  className={`flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br ${card.accent} text-white shadow-md transition-transform duration-300 group-hover:scale-110`}
                >
                  {card.icon}
                </div>
              </div>

              {/* Alt bilgi satırı — Çözülme oranı veya ek bilgi */}
              <div className="mt-3 flex items-center gap-1.5">
                {card.key === 'resolved' && (
                  <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-accent-50 text-accent-600">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    %{stats.resolutionRate} çözülme oranı
                  </span>
                )}
                {card.key === 'pending' && stats.inProgress > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-info-500/10 text-info-600">
                    <Activity className="w-3.5 h-3.5" />
                    {stats.inProgress} tanesi işlemde
                  </span>
                )}
                {card.key === 'critical' && stats.urgent > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-danger-500/10 text-danger-600">
                    <ArrowDownRight className="w-3.5 h-3.5" />
                    {stats.urgent} acil
                  </span>
                )}
                {card.key === 'total' && (
                  <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-surface-100 text-surface-500">
                    {stats.rejected > 0 && `${stats.rejected} reddedildi`}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
