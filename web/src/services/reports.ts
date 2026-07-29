import { supabase } from '../lib/supabase'
import type { ReportWithRelations, ReportStatus, Category } from '../types'

/**
 * Raporları kategorileri ve profil bilgileriyle birlikte getirir.
 */
export async function getReports(): Promise<ReportWithRelations[]> {
  const { data, error } = await supabase
    .from('reports')
    .select(`
      *,
      category:categories(*),
      citizen:profiles!reports_citizen_id_fkey(*),
      assigned_official:profiles!reports_assigned_official_id_fkey(*)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching reports:', error)
    throw new Error('Raporlar yüklenirken bir hata oluştu.')
  }

  // Tip uyumluluğunu sağlamak için fallback kontrolleri
  return (data || []).map((report) => ({
    ...report,
    category: Array.isArray(report.category) ? report.category[0] : report.category,
    citizen: Array.isArray(report.citizen) ? report.citizen[0] : report.citizen,
    assigned_official: Array.isArray(report.assigned_official) ? report.assigned_official[0] : report.assigned_official,
  })) as ReportWithRelations[]
}

/**
 * Tüm kategorileri getirir. (Filtreleme için)
 */
export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching categories:', error)
    throw new Error('Kategoriler yüklenirken bir hata oluştu.')
  }

  return data || []
}

/**
 * Belirli bir raporun durumunu günceller ve history tablosuna kaydeder.
 * official ve admin rolündeki kullanıcılar tarafından çağrılmalıdır.
 */
export async function updateReportStatus(
  reportId: string,
  newStatus: ReportStatus,
  changedById: string
): Promise<void> {
  // 1. Raporun durumunu güncelle
  const { error: updateError } = await supabase
    .from('reports')
    .update({ status: newStatus })
    .eq('id', reportId)

  if (updateError) {
    console.error('Error updating report status:', updateError)
    throw new Error('Rapor durumu güncellenirken bir hata oluştu.')
  }

  // 2. Geçmiş tablosuna kayıt at
  const { error: historyError } = await supabase
    .from('report_history')
    .insert({
      report_id: reportId,
      status: newStatus,
      changed_by: changedById,
      notes: 'Durum güncellendi',
    })

  if (historyError) {
    console.error('Error inserting report history:', historyError)
    // Sadece loglamak yeterli olabilir, ana durum değişti.
  }
}
