import React from 'react'
import { Calendar, MapPin, Tag } from 'lucide-react'
import type { ReportWithRelations, ReportStatus } from '../../types'
import { useAuth } from '../../context/AuthContext'

interface IssueCardProps {
  report: ReportWithRelations
  onClick: (report: ReportWithRelations) => void
  onStatusChange?: (reportId: string, newStatus: ReportStatus) => void
}

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

export default function IssueCard({ report, onClick, onStatusChange }: IssueCardProps) {
  const { profile } = useAuth()
  const canUpdateStatus = profile?.role === 'official' || profile?.role === 'admin'

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation() // Kartın tıklanmasını engelle
    if (onStatusChange) {
      onStatusChange(report.id, e.target.value as ReportStatus)
    }
  }

  return (
    <div
      onClick={() => onClick(report)}
      className="group flex flex-col glass-card overflow-hidden cursor-pointer hover:-translate-y-1 transition-all duration-300 hover:shadow-[var(--shadow-card-lg)]"
    >
      {/* Resim Alanı */}
      <div className="relative h-48 w-full overflow-hidden bg-surface-200">
        {report.image_url ? (
          <img
            src={report.image_url}
            alt={report.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-surface-400">
            <span className="text-sm font-medium">Görsel Yok</span>
          </div>
        )}
        
        {/* Durum Rozeti */}
        <div className="absolute top-3 right-3">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-md shadow-sm ${
              statusBadge[report.status].cls
            }`}
          >
            {statusBadge[report.status].label}
          </span>
        </div>
      </div>

      {/* İçerik Alanı */}
      <div className="flex flex-col flex-1 p-5">
        <h3 className="text-lg font-bold text-surface-900 line-clamp-1 mb-2">
          {report.title}
        </h3>
        
        <div className="space-y-2 mt-auto">
          {/* Lokasyon */}
          {report.address && (
            <div className="flex items-start gap-2 text-surface-500 text-sm">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-primary-500" />
              <span className="line-clamp-2 leading-tight">{report.address}</span>
            </div>
          )}

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-surface-200">
            {/* Kategori */}
            <div className="flex items-center gap-1.5 text-xs font-medium text-surface-600 bg-surface-100 px-2.5 py-1 rounded-md">
              <Tag className="w-3.5 h-3.5" />
              {report.category?.name || 'Kategori Yok'}
            </div>
            
            {/* Tarih */}
            <div className="flex items-center gap-1.5 text-xs text-surface-500">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(report.created_at).toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'short',
              })}
            </div>
          </div>
        </div>

        {/* Yetkili - Durum Güncelleme Aksiyonu */}
        {canUpdateStatus && (
          <div className="mt-4 pt-4 border-t border-surface-200" onClick={(e) => e.stopPropagation()}>
            <label className="block text-xs font-medium text-surface-700 mb-1">
              Durumu Güncelle
            </label>
            <select
              value={report.status}
              onChange={handleStatusChange}
              className="block w-full rounded-md border-surface-300 text-sm focus:border-primary-500 focus:ring-primary-500 shadow-sm transition-colors py-2 px-3 bg-surface-50"
            >
              <option value="pending">Bekliyor</option>
              <option value="in_progress">İşleme Al</option>
              <option value="resolved">Çözüldü İşaretle</option>
              <option value="rejected">Reddet</option>
            </select>
          </div>
        )}
      </div>
    </div>
  )
}
