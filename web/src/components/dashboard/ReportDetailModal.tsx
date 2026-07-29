import React, { useEffect } from 'react'
import { X, MapPin, Calendar, User, Tag } from 'lucide-react'
import type { ReportWithRelations } from '../../types'

interface ReportDetailModalProps {
  report: ReportWithRelations | null
  onClose: () => void
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

export default function ReportDetailModal({ report, onClose }: ReportDetailModalProps) {
  // ESC tuşu ile kapatma
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!report) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Arkaplan Overlay */}
      <div 
        className="absolute inset-0 bg-surface-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal İçeriği */}
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Kapat Butonu */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-surface-900/40 text-white hover:bg-surface-900/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header / Resim */}
        <div className="relative h-64 sm:h-80 w-full bg-surface-200 shrink-0">
          {report.image_url ? (
            <img
              src={report.image_url}
              alt={report.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-surface-400">
              <span className="text-lg font-medium">Görsel Bulunamadı</span>
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          <div className="absolute bottom-0 left-0 p-6 w-full">
            <div className="flex items-center gap-3 mb-2">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-md ${
                  statusBadge[report.status].cls
                } border-transparent bg-white/20 text-white`}
              >
                {statusBadge[report.status].label}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-white/90 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full">
                <Tag className="w-3.5 h-3.5" />
                {report.category?.name || 'Kategori Yok'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {report.title}
            </h2>
          </div>
        </div>

        {/* Detaylar */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Sol Kolon - Açıklama */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-surface-900 uppercase tracking-wider mb-3">
                  Detaylı Açıklama
                </h3>
                <p className="text-surface-700 leading-relaxed whitespace-pre-wrap">
                  {report.description}
                </p>
              </div>

              {report.address && (
                <div>
                  <h3 className="text-sm font-semibold text-surface-900 uppercase tracking-wider mb-3">
                    Konum
                  </h3>
                  <div className="flex items-start gap-3 bg-surface-50 p-4 rounded-xl border border-surface-100">
                    <MapPin className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
                    <span className="text-surface-700">{report.address}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Sağ Kolon - Meta Bilgiler */}
            <div className="space-y-6">
              {/* Bildiren Kişi */}
              <div>
                <h3 className="text-sm font-semibold text-surface-900 uppercase tracking-wider mb-3">
                  Bildiren
                </h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center shrink-0 font-bold">
                    {report.citizen?.full_name ? report.citizen.full_name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-surface-900">
                      {report.citizen?.full_name || 'İsimsiz Kullanıcı'}
                    </p>
                    <p className="text-xs text-surface-500">Vatandaş</p>
                  </div>
                </div>
              </div>

              {/* Tarih Bilgisi */}
              <div>
                <h3 className="text-sm font-semibold text-surface-900 uppercase tracking-wider mb-3">
                  Tarih
                </h3>
                <div className="flex items-center gap-2 text-surface-700 text-sm">
                  <Calendar className="w-4 h-4 text-surface-400 shrink-0" />
                  {new Date(report.created_at).toLocaleString('tr-TR', {
                    dateStyle: 'long',
                    timeStyle: 'short'
                  })}
                </div>
              </div>

              {/* İlgilenen Yetkili */}
              {report.assigned_official && (
                <div>
                  <h3 className="text-sm font-semibold text-surface-900 uppercase tracking-wider mb-3">
                    İlgilenen Yetkili
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-info-100 text-info-600 flex items-center justify-center shrink-0 font-bold">
                      {report.assigned_official.full_name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-surface-900">
                        {report.assigned_official.full_name}
                      </p>
                      <p className="text-xs text-surface-500">Belediye Görevlisi</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
