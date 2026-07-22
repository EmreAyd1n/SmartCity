import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types'

// ────────────────────────────────────────
// Ortam değişkenlerini oku ve doğrula
// ────────────────────────────────────────

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase yapılandırması eksik!\n' +
    'Lütfen .env.local dosyasında VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY değerlerini tanımlayın.\n' +
    'Detaylar için .env.example dosyasına bakın.'
  )
}

// ────────────────────────────────────────
// Tip-güvenli Supabase istemcisi
// ────────────────────────────────────────

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
