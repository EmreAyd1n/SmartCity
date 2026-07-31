import React, { useEffect, useState, useCallback } from 'react'
import {
  Plus,
  Loader2,
  Map,
  List,
} from 'lucide-react'

import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import type { ReportWithRelations, Category, ReportStatus } from '../types'
import { getReports, getCategories, updateReportStatus } from '../services/reports'
import ReportsList from '../components/dashboard/ReportsList'
import ReportDetailModal from '../components/dashboard/ReportDetailModal'
import CreateReportModal from '../components/dashboard/CreateReportModal'
import StatsOverview from '../components/dashboard/StatsOverview'
import InteractiveMap from '../components/map/InteractiveMap'

export default function DashboardPage() {
  const { profile } = useAuth()
  const { addToast } = useToast()

  const [reports, setReports] = useState<ReportWithRelations[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<ReportWithRelations | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [viewMode, setViewMode] = useState<'list' | 'map'>('map')

  const isOfficial = profile?.role === 'official' || profile?.role === 'admin'

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

  const refreshReports = useCallback(async () => {
    try {
      setLoading(true)
      const reportsData = await getReports()
      setReports(reportsData)
      // İstatistik kartlarını da yenile
      setRefreshKey(prev => prev + 1)
    } catch (error: any) {
      addToast(error.message || 'Veriler yüklenirken hata oluştu.', 'error')
    } finally {
      setLoading(false)
    }
  }, [addToast])

  const handleStatusChange = async (reportId: string, newStatus: ReportStatus) => {
    if (!profile) return
    try {
      await updateReportStatus(reportId, newStatus, profile.id)

      // UI State'i güncelle
      setReports(prev => prev.map(r =>
        r.id === reportId ? { ...r, status: newStatus } : r
      ))

      // İstatistik kartlarını da yenile
      setRefreshKey(prev => prev + 1)

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
            {isOfficial ? 'Yönetim Paneli' : 'Dashboard'}
          </h1>
          <p className="text-surface-500 text-sm mt-1">
            {isOfficial
              ? 'Şehirdeki tüm bildirimleri yönetin ve operasyon durumunu takip edin'
              : 'Bildirim ve operasyon durumuna genel bakış'}
          </p>
        </div>

        {profile?.role === 'citizen' && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Yeni Sorun Bildir
          </button>
        )}
      </div>

      {/* ── İstatistik Kartları (StatsOverview) ── */}
      <StatsOverview
        role={profile?.role ?? 'citizen'}
        refreshKey={refreshKey}
      />

      {/* ── Harita / Liste Görünümü Toggle ve İçerik ── */}
      <div className="flex flex-col gap-4 mt-2">
        <div className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-surface-200">
          <h2 className="text-lg font-semibold text-surface-900 ml-2">
            Bildirimler
          </h2>
          <div className="flex bg-surface-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('map')}
              className={`px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 transition-all duration-200 ${viewMode === 'map' ? 'bg-white shadow-sm text-primary-600' : 'text-surface-600 hover:text-surface-900 hover:bg-surface-200'}`}
            >
              <Map className="w-4 h-4" />
              Harita
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 transition-all duration-200 ${viewMode === 'list' ? 'bg-white shadow-sm text-primary-600' : 'text-surface-600 hover:text-surface-900 hover:bg-surface-200'}`}
            >
              <List className="w-4 h-4" />
              Liste
            </button>
          </div>
        </div>

        <div className="min-h-[500px]">
          {viewMode === 'map' ? (
            <div className="h-[600px] w-full animate-in fade-in duration-300">
              <InteractiveMap 
                reports={reports} 
                onMarkerClick={(report) => setSelectedReport(report)} 
              />
            </div>
          ) : (
            <div className="animate-in fade-in duration-300">
              <ReportsList
                reports={reports}
                categories={categories}
                onReportClick={setSelectedReport}
                onStatusChange={handleStatusChange}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Modallar ── */}
      <ReportDetailModal
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
      />

      <CreateReportModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={refreshReports}
        categories={categories}
      />
    </div>
  )
}
