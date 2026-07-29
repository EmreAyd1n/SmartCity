import React, { useEffect, useState, useMemo } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  Loader2
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import type { StatCard, ReportWithRelations, Category, ReportStatus } from '../types'
import { getReports, getCategories, updateReportStatus } from '../services/reports'
import ReportsList from '../components/dashboard/ReportsList'
import ReportDetailModal from '../components/dashboard/ReportDetailModal'

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

export default function DashboardPage() {
  const { profile } = useAuth()
  const { addToast } = useToast()
  
  const [reports, setReports] = useState<ReportWithRelations[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<ReportWithRelations | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const [reportsData, categoriesData] = await Promise.all([
          getReports(),
          getCategories()
        ])
        setReports(reportsData)
        setCategories(categoriesData)
      } catch (error: any) {
        addToast(error.message || 'Veriler yüklenirken hata oluştu.', 'error')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [addToast])

  // İstatistikleri hesapla
  const stats: StatCard[] = useMemo(() => {
    const total = reports.length
    const pending = reports.filter(r => r.status === 'pending').length
    const resolved = reports.filter(r => r.status === 'resolved').length
    const urgent = reports.filter(r => r.priority === 'urgent' || r.priority === 'high').length

    return [
      {
        label: 'Toplam Bildirim',
        value: total,
        icon: 'file',
        trend: 'up',
        change: 0 // Statik (örnek amaçlı)
      },
      {
        label: 'Bekleyen',
        value: pending,
        icon: 'clock',
        trend: 'down',
        change: 0
      },
      {
        label: 'Çözülen',
        value: resolved,
        icon: 'check',
        trend: 'up',
        change: 0
      },
      {
        label: 'Kritik / Yüksek Öncelikli',
        value: urgent,
        icon: 'alert',
        trend: 'neutral'
      }
    ]
  }, [reports])

  const handleStatusChange = async (reportId: string, newStatus: ReportStatus) => {
    if (!profile) return
    try {
      await updateReportStatus(reportId, newStatus, profile.id)
      
      // UI State'i güncelle
      setReports(prev => prev.map(r => 
        r.id === reportId ? { ...r, status: newStatus } : r
      ))
      
      addToast('Durum başarıyla güncellendi.', 'success')
    } catch (error: any) {
      addToast(error.message || 'Durum güncellenirken hata oluştu.', 'error')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
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
            {stat.trend && stat.change !== 0 && (
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

      {/* ── Dinamik Liste ── */}
      <ReportsList
        reports={reports}
        categories={categories}
        onReportClick={setSelectedReport}
        onStatusChange={handleStatusChange}
      />

      {/* ── Modal ── */}
      <ReportDetailModal
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
      />
    </div>
  )
}
