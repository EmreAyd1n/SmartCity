import React, { useEffect, useState } from 'react'
import {
  X,
  MapPin,
  Calendar,
  User,
  Tag,
  History,
  ArrowRight,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import type { ReportWithRelations } from '../../types'
import { getReportHistory, type ReportHistoryWithProfile } from '../../services/reports'

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

const statusDotColor: Record<string, string> = {
  pending: 'bg-warning-500',
  in_progress: 'bg-info-500',
  resolved: 'bg-accent-500',
  rejected: 'bg-danger-500',
}

export default function ReportDetailModal({ report, onClose }: ReportDetailModalProps) {
  const [history, setHistory] = useState<ReportHistoryWithProfile[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)

  // ESC tuşu ile kapatma
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Rapor değiştiğinde geçmişi yükle
  useEffect(() => {
    if (!report) {
      setHistory([])
      setHistoryOpen(false)
      return
    }

    async function fetchHistory() {
      if (!report) return
      try {
        setHistoryLoading(true)
        const data = await getReportHistory(report.id)
        setHistory(data)
      } catch (err) {
        console.error('History fetch error:', err)
        setHistory([])
      } finally {
        setHistoryLoading(false)
      }
    }

    fetchHistory()
  }, [report?.id])

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

          {/* ── Durum Değişiklik Tarihçesi (Audit History) ── */}
          <div className="mt-8 border-t border-surface-100 pt-6">
            <button
              onClick={() => setHistoryOpen(!historyOpen)}
              className="flex items-center justify-between w-full group"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-500/10 text-primary-600">
                  <History className="w-4.5 h-4.5" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-semibold text-surface-900 uppercase tracking-wider">
                    Değişiklik Tarihçesi
                  </h3>
                  <p className="text-xs text-surface-500">
                    {history.length > 0
                      ? `${history.length} durum değişikliği`
                      : 'Henüz değişiklik yok'}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-surface-100 text-surface-500 transition-colors group-hover:bg-surface-200">
                {historyOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </div>
            </button>

            {/* Timeline */}
            {historyOpen && (
              <div className="mt-4 animate-in slide-in-from-top-2 duration-200">
                {historyLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
                    <span className="ml-2 text-sm text-surface-500">Yükleniyor…</span>
                  </div>
                ) : history.length === 0 ? (
                  <div className="py-6 text-center">
                    <History className="w-8 h-8 text-surface-300 mx-auto mb-2" />
                    <p className="text-sm text-surface-500">
                      Bu rapor için henüz durum değişikliği kaydı bulunmuyor.
                    </p>
                  </div>
                ) : (
                  <div className="relative ml-4 border-l-2 border-surface-200 space-y-0">
                    {history.map((entry, idx) => (
                      <div
                        key={entry.id}
                        className="relative pl-6 pb-6 last:pb-0 group/entry"
                        style={{ animationDelay: `${idx * 60}ms` }}
                      >
                        {/* Timeline dot */}
                        <div
                          className={`absolute -left-[9px] top-0.5 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                            statusDotColor[entry.status] || 'bg-surface-400'
                          }`}
                        />

                        <div className="glass-card p-4 transition-shadow duration-200 hover:shadow-[var(--shadow-card-lg)]">
                          {/* Durum badge */}
                          <div className="flex items-center flex-wrap gap-2 mb-2">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                statusBadge[entry.status]?.cls || 'bg-surface-100 text-surface-600'
                              }`}
                            >
                              {statusBadge[entry.status]?.label || entry.status}
                            </span>

                            {/* Önceki durum → yeni durum gösterimi */}
                            {idx > 0 && (
                              <span className="inline-flex items-center gap-1 text-xs text-surface-400">
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                    statusBadge[history[idx - 1].status]?.cls || 'bg-surface-100 text-surface-600'
                                  }`}
                                >
                                  {statusBadge[history[idx - 1].status]?.label || history[idx - 1].status}
                                </span>
                                <ArrowRight className="w-3 h-3 text-surface-400" />
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                    statusBadge[entry.status]?.cls || 'bg-surface-100 text-surface-600'
                                  }`}
                                >
                                  {statusBadge[entry.status]?.label || entry.status}
                                </span>
                              </span>
                            )}
                          </div>

                          {/* Not */}
                          {entry.notes && (
                            <p className="text-sm text-surface-700 mb-2">
                              {entry.notes}
                            </p>
                          )}

                          {/* Meta: Kişi + Tarih */}
                          <div className="flex items-center flex-wrap gap-3 text-xs text-surface-500">
                            <span className="inline-flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-[10px] font-bold">
                                {entry.changer?.full_name
                                  ? entry.changer.full_name.charAt(0).toUpperCase()
                                  : '?'}
                              </div>
                              {entry.changer?.full_name || 'Bilinmeyen Kullanıcı'}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(entry.created_at).toLocaleString('tr-TR', {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
