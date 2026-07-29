import React, { useState, useMemo } from 'react'
import { Filter, Search } from 'lucide-react'
import type { ReportWithRelations, ReportStatus, Category } from '../../types'
import IssueCard from './IssueCard'

interface ReportsListProps {
  reports: ReportWithRelations[]
  categories: Category[]
  onReportClick: (report: ReportWithRelations) => void
  onStatusChange: (reportId: string, newStatus: ReportStatus) => void
}

export default function ReportsList({
  reports,
  categories,
  onReportClick,
  onStatusChange,
}: ReportsListProps) {
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchStatus = statusFilter === 'all' || report.status === statusFilter
      const matchCategory = categoryFilter === 'all' || report.category_id === categoryFilter
      const matchSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (report.address?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      
      return matchStatus && matchCategory && matchSearch
    })
  }, [reports, statusFilter, categoryFilter, searchQuery])

  return (
    <div className="space-y-6">
      {/* Filtreleme ve Arama Çubuğu */}
      <div className="glass-card p-4 sm:p-5 flex flex-col sm:flex-row gap-4">
        
        {/* Arama */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-surface-400" />
          </div>
          <input
            type="text"
            placeholder="Sorun başlığı veya konum ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 border border-surface-200 rounded-xl bg-surface-50 text-surface-900 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow sm:text-sm"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Kategori Filtresi */}
          <div className="relative flex-1 sm:w-48">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-surface-400" />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="block w-full pl-9 pr-8 py-2.5 border border-surface-200 rounded-xl bg-surface-50 text-surface-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow sm:text-sm appearance-none"
            >
              <option value="all">Tüm Kategoriler</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Durum Filtresi */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ReportStatus | 'all')}
            className="block flex-1 sm:w-40 px-3 py-2.5 border border-surface-200 rounded-xl bg-surface-50 text-surface-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow sm:text-sm"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="pending">Bekliyor</option>
            <option value="in_progress">İşlemde</option>
            <option value="resolved">Çözüldü</option>
            <option value="rejected">Reddedildi</option>
          </select>
        </div>
      </div>

      {/* Rapor Listesi */}
      {filteredReports.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredReports.map((report) => (
            <IssueCard
              key={report.id}
              report={report}
              onClick={onReportClick}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center mb-4">
            <Filter className="w-8 h-8 text-surface-400" />
          </div>
          <h3 className="text-lg font-medium text-surface-900 mb-1">Kayıt Bulunamadı</h3>
          <p className="text-surface-500 max-w-sm">
            Seçtiğiniz filtrelere uygun sorun bildirimi bulunamadı. Lütfen arama kriterlerinizi değiştirerek tekrar deneyin.
          </p>
        </div>
      )}
    </div>
  )
}
