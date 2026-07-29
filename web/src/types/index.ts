/* ========================================
   Type definitions for the Civic Reporter
   Supabase veritabanı şemasıyla %100 uyumlu
   ======================================== */

// ────────────────────────────────────────
// Enum-like Type Aliases
// ────────────────────────────────────────

/** Kullanıcı rolü */
export type UserRole = 'citizen' | 'admin' | 'official'

/** Bildirim durumu */
export type ReportStatus = 'pending' | 'in_progress' | 'resolved' | 'rejected'

/** Bildirim önceliği */
export type ReportPriority = 'low' | 'medium' | 'high' | 'urgent'

// ────────────────────────────────────────
// Database Table Interfaces
// ────────────────────────────────────────

/** profiles tablosu — Kullanıcı profili */
export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  avatar_url: string | null
  created_at: string
}

/** categories tablosu — Şikayet kategorisi */
export interface Category {
  id: string
  name: string
  icon: string
  description: string | null
  created_at: string
}

/** reports tablosu — Vatandaş bildirimi */
export interface Report {
  id: string
  title: string
  description: string
  category_id: string
  status: ReportStatus
  priority: ReportPriority
  latitude: number | null
  longitude: number | null
  address: string | null
  image_url: string | null
  citizen_id: string
  assigned_official_id: string | null
  created_at: string
  updated_at: string
}

/** report_history tablosu — Durum değişim geçmişi */
export interface ReportHistory {
  id: string
  report_id: string
  status: ReportStatus
  notes: string | null
  changed_by: string
  created_at: string
}

// ────────────────────────────────────────
// Insert/Update DTOs (Data Transfer Objects)
// ────────────────────────────────────────

/** Yeni bildirim oluşturmak için gerekli alanlar */
export type ReportInsert = Omit<Report, 'id' | 'status' | 'created_at' | 'updated_at'> & {
  status?: ReportStatus
}

/** Bildirim güncellemek için opsiyonel alanlar */
export type ReportUpdate = Partial<Omit<Report, 'id' | 'citizen_id' | 'created_at'>>

/** Yeni kategori oluşturma */
export type CategoryInsert = Omit<Category, 'id' | 'created_at'>

/** Profil güncelleme */
export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'email' | 'created_at'>>

/** Durum geçmişi oluşturma */
export type ReportHistoryInsert = Omit<ReportHistory, 'id' | 'created_at'>

// ────────────────────────────────────────
// İlişkisel / Birleştirilmiş Tipler
// ────────────────────────────────────────

/** Kategori ve profil bilgileriyle zenginleştirilmiş bildirim */
export interface ReportWithRelations extends Report {
  category: Category
  citizen: Profile
  assigned_official: Profile | null
  history?: ReportHistory[]
}

// ────────────────────────────────────────
// UI Yardımcı Tipleri
// ────────────────────────────────────────

/** Dashboard istatistik kartı verisi */
export interface StatCard {
  label: string
  value: number | string
  change?: number        // yüzde değişim
  trend?: 'up' | 'down' | 'neutral'
  icon?: string
}

/** Sidebar menü öğesi */
export interface NavItem {
  label: string
  path: string
  icon: string
  badge?: number
}

// ────────────────────────────────────────
// Supabase Database Tipleri
// ────────────────────────────────────────

/** Supabase Database şema tanımı (tip-güvenli sorgular için) */
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at'> & { created_at?: string }
        Update: ProfileUpdate
      }
      categories: {
        Row: Category
        Insert: CategoryInsert & { id?: string; created_at?: string }
        Update: Partial<CategoryInsert>
      }
      reports: {
        Row: Report
        Insert: ReportInsert & { id?: string; created_at?: string; updated_at?: string }
        Update: ReportUpdate
      }
      report_history: {
        Row: ReportHistory
        Insert: ReportHistoryInsert & { id?: string; created_at?: string }
        Update: Partial<ReportHistoryInsert>
      }
    }
  }
}
