-- ============================================================
-- Civic Reporter — Supabase Database Schema
-- Gün 3: Veritabanı Mimarisi
-- ============================================================

-- UUID oluşturucu extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Şifreleme (crypt) fonksiyonları için extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. PROFILES — Kullanıcı profilleri ve yetki bilgileri
-- ============================================================
-- auth.users tablosuyla 1:1 ilişki.
-- Supabase Auth trigger'ı ile otomatik oluşturulur.

CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT UNIQUE NOT NULL,
  full_name   TEXT,
  role        TEXT NOT NULL DEFAULT 'citizen'
              CHECK (role IN ('citizen', 'admin', 'staff')),
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Yeni kullanıcı kaydında otomatik profil oluşturma
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'citizen')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: auth.users INSERT → profiles INSERT
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();


-- ============================================================
-- 2. CATEGORIES — Şikayet kategorileri
-- ============================================================

CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT UNIQUE NOT NULL,
  icon        TEXT NOT NULL DEFAULT 'circle',
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ============================================================
-- 3. REPORTS — Vatandaş bildirimleri
-- ============================================================

CREATE TABLE IF NOT EXISTS reports (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title             TEXT NOT NULL,
  description       TEXT NOT NULL,
  category_id       UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'in_progress', 'resolved', 'rejected')),
  priority          TEXT NOT NULL DEFAULT 'medium'
                    CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  latitude          DOUBLE PRECISION,
  longitude         DOUBLE PRECISION,
  address           TEXT,
  image_url         TEXT,
  citizen_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_staff_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Performans indeksleri
CREATE INDEX IF NOT EXISTS idx_reports_status      ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_category_id ON reports(category_id);
CREATE INDEX IF NOT EXISTS idx_reports_citizen_id  ON reports(citizen_id);
CREATE INDEX IF NOT EXISTS idx_reports_priority    ON reports(priority);
CREATE INDEX IF NOT EXISTS idx_reports_created_at  ON reports(created_at DESC);

-- updated_at otomatik güncelleme fonksiyonu
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_reports_updated_at ON reports;
CREATE TRIGGER set_reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- ============================================================
-- 4. REPORT_HISTORY — Şikayet durum değişim geçmişi
-- ============================================================

CREATE TABLE IF NOT EXISTS report_history (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id   UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  status      TEXT NOT NULL
              CHECK (status IN ('pending', 'in_progress', 'resolved', 'rejected')),
  notes       TEXT,
  changed_by  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_report_history_report_id ON report_history(report_id);


-- ============================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Tüm tablolarda RLS etkinleştir
ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories     ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports        ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_history ENABLE ROW LEVEL SECURITY;

-- ────────────────────────────────────────────────────────────
-- PROFILES politikaları
-- ────────────────────────────────────────────────────────────

-- Herkes profilleri görebilir (genel bilgi)
CREATE POLICY "profiles_select_all"
  ON profiles FOR SELECT
  USING (true);

-- Kullanıcı yalnızca kendi profilini güncelleyebilir
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ────────────────────────────────────────────────────────────
-- CATEGORIES politikaları
-- ────────────────────────────────────────────────────────────

-- Herkes kategorileri görebilir
CREATE POLICY "categories_select_all"
  ON categories FOR SELECT
  USING (true);

-- Yalnızca admin yeni kategori ekleyebilir
CREATE POLICY "categories_insert_admin"
  ON categories FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Yalnızca admin kategori güncelleyebilir
CREATE POLICY "categories_update_admin"
  ON categories FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ────────────────────────────────────────────────────────────
-- REPORTS politikaları
-- ────────────────────────────────────────────────────────────

-- Herkes bildirimleri görebilir (şeffaflık)
CREATE POLICY "reports_select_all"
  ON reports FOR SELECT
  USING (true);

-- Giriş yapmış kullanıcı bildirim oluşturabilir
CREATE POLICY "reports_insert_authenticated"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = citizen_id);

-- Vatandaş kendi bildirimini, admin/staff ise tüm bildirimleri güncelleyebilir
CREATE POLICY "reports_update_owner_or_staff"
  ON reports FOR UPDATE
  USING (
    auth.uid() = citizen_id
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'staff')
    )
  );

-- Yalnızca admin bildirim silebilir
CREATE POLICY "reports_delete_admin"
  ON reports FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ────────────────────────────────────────────────────────────
-- REPORT_HISTORY politikaları
-- ────────────────────────────────────────────────────────────

-- Herkes geçmişi görebilir
CREATE POLICY "report_history_select_all"
  ON report_history FOR SELECT
  USING (true);

-- Admin ve staff durum değişikliği ekleyebilir
CREATE POLICY "report_history_insert_staff"
  ON report_history FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'staff')
    )
  );


-- ============================================================
-- 6. SEED DATA — Örnek veriler
-- ============================================================

-- ── Varsayılan Kategoriler ──────────────────────────────────

INSERT INTO categories (id, name, icon, description) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Altyapı & Yol',    'construction',  'Çukur, kaldırım hasarı, yol bozukluğu ve altyapı sorunları'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'Aydınlatma',       'lightbulb',     'Sokak lambası arızaları ve karanlık bölge bildirimleri'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'Çevre & Temizlik', 'trash-2',       'Çöp toplama, atık birikimleri ve çevre kirliliği'),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'Su & Kanalizasyon','droplets',      'Su kesintisi, boru patlaması, kanalizasyon tıkanıklığı')
ON CONFLICT (id) DO NOTHING;

-- ── Örnek Kullanıcılar (auth.users) ve Profiller ───────────
-- NOT: auth.users tablosuna eklendiğinde on_auth_user_created 
-- trigger'ı profiles tablosuna otomatik olarak kayıt ekler.
-- Ancak her ihtimale karşı seed verilerinde her iki tabloyu da
-- sağlamlaştırılmış (ON CONFLICT ile) şekilde oluşturuyoruz.

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) VALUES
  ('00000000-0000-4000-a000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@civicreporter.dev', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Ayşe Yılmaz","role":"admin"}', now(), now()),
  ('00000000-0000-4000-a000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'staff@civicreporter.dev', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Mehmet Kaya","role":"staff"}', now(), now()),
  ('00000000-0000-4000-a000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'citizen@civicreporter.dev', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Zeynep Demir","role":"citizen"}', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, email, full_name, role) VALUES
  ('00000000-0000-4000-a000-000000000001', 'admin@civicreporter.dev',  'Ayşe Yılmaz',    'admin'),
  ('00000000-0000-4000-a000-000000000002', 'staff@civicreporter.dev',  'Mehmet Kaya',     'staff'),
  ('00000000-0000-4000-a000-000000000003', 'citizen@civicreporter.dev','Zeynep Demir',    'citizen')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- ── Örnek Bildirimler ───────────────────────────────────────

INSERT INTO reports (id, title, description, category_id, status, priority, latitude, longitude, address, citizen_id, assigned_staff_id) VALUES
  (
    'b0b0b0b0-0001-4000-b000-000000000001',
    'Atatürk Caddesi''nde derin çukur',
    'Ana cadde üzerinde araç lastiğine zarar verecek boyutta derin bir çukur oluşmuş. Özellikle gece görünmediği için tehlike arz ediyor.',
    'a1b2c3d4-0001-4000-8000-000000000001',  -- Altyapı & Yol
    'in_progress',
    'high',
    39.9208,
    32.8541,
    'Atatürk Caddesi No:42, Çankaya/Ankara',
    '00000000-0000-4000-a000-000000000003',  -- citizen
    '00000000-0000-4000-a000-000000000002'   -- staff
  ),
  (
    'b0b0b0b0-0002-4000-b000-000000000002',
    'Park girişinde sokak lambası yanmıyor',
    'Gençlik Parkı ana girişindeki 3 adet sokak lambası yaklaşık 1 haftadır yanmıyor. Akşam saatlerinde karanlık oluyor ve güvenlik riski oluşturuyor.',
    'a1b2c3d4-0002-4000-8000-000000000002',  -- Aydınlatma
    'pending',
    'medium',
    39.9334,
    32.8597,
    'Gençlik Parkı Girişi, Ulus/Ankara',
    '00000000-0000-4000-a000-000000000003',  -- citizen
    NULL
  ),
  (
    'b0b0b0b0-0003-4000-b000-000000000003',
    'Çöp konteynerleri taşmış durumda',
    'Mahalle arasındaki 4 adet çöp konteynerinin tamamı taşmış durumda. Koku ve sağlık problemi oluşturuyor. Acil müdahale gerekli.',
    'a1b2c3d4-0003-4000-8000-000000000003',  -- Çevre & Temizlik
    'pending',
    'urgent',
    39.9120,
    32.8636,
    'Kızılay Mahallesi, 7. Sokak, Çankaya/Ankara',
    '00000000-0000-4000-a000-000000000003',  -- citizen
    NULL
  )
ON CONFLICT (id) DO NOTHING;

-- ── Örnek Durum Geçmişi ────────────────────────────────────

INSERT INTO report_history (report_id, status, notes, changed_by) VALUES
  (
    'b0b0b0b0-0001-4000-b000-000000000001',
    'pending',
    'Bildirim oluşturuldu.',
    '00000000-0000-4000-a000-000000000003'
  ),
  (
    'b0b0b0b0-0001-4000-b000-000000000001',
    'in_progress',
    'Yol bakım ekibi yönlendirildi. Tahmini tamamlanma: 2 iş günü.',
    '00000000-0000-4000-a000-000000000002'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- TAMAMLANDI ✓
-- Tablolar: profiles, categories, reports, report_history
-- RLS Politikaları: Tüm tablolarda aktif
-- Seed Data: 4 kategori, 3 profil, 3 bildirim, 2 geçmiş kaydı
-- ============================================================
