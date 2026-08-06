import { supabase } from '../lib/supabase'
import type {
  ReportWithRelations,
  ReportStatus,
  Category,
  ReportInsert,
  ReportHistory,
  Profile,
} from '../types'

// ────────────────────────────────────────
// Dashboard İstatistik Tipleri
// ────────────────────────────────────────

export interface DashboardStats {
  total: number
  pending: number
  inProgress: number
  resolved: number
  rejected: number
  urgent: number
  high: number
  /** Çözülme oranı (0–100) */
  resolutionRate: number
}

/** Profil bilgisi eklenmiş rapor geçmişi */
export interface ReportHistoryWithProfile extends ReportHistory {
  changer: Profile | null
}

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
  return (data as any[] || []).map((report) => ({
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


/**
 * Rapor için görsel yükler ve public URL'ini döner.
 */
export async function uploadReportImage(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
  const filePath = `${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('issues')
    .upload(filePath, file)

  if (uploadError) {
    console.error('Error uploading image:', uploadError)
    throw new Error('Görsel yüklenirken bir hata oluştu.')
  }

  const { data } = supabase.storage
    .from('issues')
    .getPublicUrl(filePath)

  return data.publicUrl
}

/**
 * Yeni rapor oluşturur
 */
export async function createReport(
  reportData: { title: string; description: string; category_id: string; address: string; image_url?: string; latitude?: number; longitude?: number },
  citizenId: string
): Promise<void> {
  const newReport: ReportInsert = {
    title: reportData.title,
    description: reportData.description,
    category_id: reportData.category_id,
    address: reportData.address,
    image_url: reportData.image_url || null,
    citizen_id: citizenId,
    priority: 'medium',
    latitude: reportData.latitude || null,
    longitude: reportData.longitude || null,
  }

  const { error } = await supabase
    .from('reports')
    .insert(newReport)

  if (error) {
    console.error('Error creating report:', error)
    throw new Error('Rapor oluşturulurken bir hata oluştu.')
  }
}

// ────────────────────────────────────────
// Dashboard İstatistikleri
// ────────────────────────────────────────

/**
 * Tüm raporlar üzerinden durumlarına ve önceliklerine göre
 * özet sayısal verileri hesaplayıp döndürür.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const { data, error } = await supabase
    .from('reports')
    .select('status, priority')

  if (error) {
    console.error('Error fetching dashboard stats:', error)
    throw new Error('Dashboard istatistikleri yüklenirken bir hata oluştu.')
  }

  const reports = data || []
  const total = reports.length
  const pending = reports.filter(r => r.status === 'pending').length
  const inProgress = reports.filter(r => r.status === 'in_progress').length
  const resolved = reports.filter(r => r.status === 'resolved').length
  const rejected = reports.filter(r => r.status === 'rejected').length
  const urgent = reports.filter(r => r.priority === 'urgent').length
  const high = reports.filter(r => r.priority === 'high').length
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0

  return { total, pending, inProgress, resolved, rejected, urgent, high, resolutionRate }
}

// ────────────────────────────────────────
// Rapor Durum Değişim Geçmişi (Audit Log)
// ────────────────────────────────────────

/**
 * Belirli bir raporun `report_history` tablosundaki durum
 * değişim kayıtlarını ve işlemi yapan kişinin profil bilgisini getirir.
 * Sonuçlar kronolojik olarak (eskiden yeniye) sıralanır.
 */
export async function getReportHistory(
  reportId: string
): Promise<ReportHistoryWithProfile[]> {
  const { data, error } = await supabase
    .from('report_history')
    .select(`
      *,
      changer:profiles!report_history_changed_by_fkey(*)
    `)
    .eq('report_id', reportId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching report history:', error)
    throw new Error('Rapor geçmişi yüklenirken bir hata oluştu.')
  }

  return (data as any[] || []).map((entry) => ({
    ...entry,
    changer: Array.isArray(entry.changer) ? entry.changer[0] : entry.changer,
  })) as ReportHistoryWithProfile[]
}

/**
 * Belirli bir raporu ilişkileriyle birlikte getirir. (Real-time eklemeler için)
 */
export async function getReportById(reportId: string): Promise<ReportWithRelations | null> {
  const { data, error } = await supabase
    .from('reports')
    .select(`
      *,
      category:categories(*),
      citizen:profiles!reports_citizen_id_fkey(*),
      assigned_official:profiles!reports_assigned_official_id_fkey(*)
    `)
    .eq('id', reportId)
    .single()

  if (error || !data) {
    console.error('Error fetching single report:', error)
    return null
  }

  return {
    ...data,
    category: Array.isArray(data.category) ? data.category[0] : data.category,
    citizen: Array.isArray(data.citizen) ? data.citizen[0] : data.citizen,
    assigned_official: Array.isArray(data.assigned_official) ? data.assigned_official[0] : data.assigned_official,
  } as ReportWithRelations
}

// ────────────────────────────────────────
// Analiz ve Raporlama (Analytics)
// ────────────────────────────────────────

export interface AnalyticsData {
  categoryDistribution: { name: string; value: number }[];
  timeSeriesTrend: { date: string; count: number }[];
  statusDistribution: { name: string; value: number }[];
}

export type TimeRangeFilter = '7days' | '30days' | 'all';

/**
 * Analiz sayfası için grafiklere uygun gruplanmış verileri döner.
 */
export async function getAnalyticsData(timeRange: TimeRangeFilter): Promise<AnalyticsData> {
  let query = supabase.from('reports').select(`
    created_at,
    status,
    category:categories(name)
  `);

  if (timeRange === '7days') {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    query = query.gte('created_at', d.toISOString());
  } else if (timeRange === '30days') {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    query = query.gte('created_at', d.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching analytics data:', error);
    throw new Error('Analiz verileri yüklenirken bir hata oluştu.');
  }

  const reports = data || [];

  // Kategori Dağılımı
  const categoryMap = new Map<string, number>();
  // Zaman Serisi (Trend)
  const trendMap = new Map<string, number>();
  // Durum Dağılımı
  const statusMap = new Map<string, number>();

  (reports as any[]).forEach((report: any) => {
    // Kategori
    const catName = report.category ? (Array.isArray(report.category) ? report.category[0]?.name : report.category?.name) : 'Diğer';
    categoryMap.set(catName || 'Diğer', (categoryMap.get(catName || 'Diğer') || 0) + 1);

    // Durum
    const status = report.status || 'Bilinmiyor';
    statusMap.set(status, (statusMap.get(status) || 0) + 1);

    // Zaman
    if (report.created_at) {
      // YYYY-MM-DD formatında al
      const dateStr = new Date(report.created_at).toISOString().split('T')[0];
      trendMap.set(dateStr, (trendMap.get(dateStr) || 0) + 1);
    }
  });

  const categoryDistribution = Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));
  
  const statusDistribution = Array.from(statusMap.entries()).map(([name, value]) => {
    // Status isimlerini Türkçeleştir (isteğe bağlı)
    const statusLabels: Record<string, string> = {
      'pending': 'Bekliyor',
      'in_progress': 'İşlemde',
      'resolved': 'Çözüldü',
      'rejected': 'Reddedildi'
    };
    return { name: statusLabels[name] || name, value };
  });

  const timeSeriesTrend = Array.from(trendMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date)); // Tarihe göre sırala

  return {
    categoryDistribution,
    timeSeriesTrend,
    statusDistribution
  };
}

