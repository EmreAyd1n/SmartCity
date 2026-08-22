# SmartCity Mobil Mimari ve Veri Akış Dokümanı

Bu doküman, SmartCity mobil uygulamasının mimari yapısını, rol bazlı yetkilendirme şemasını, veritabanı entegrasyonunu ve yapay zeka/IoT servislerinin mobile nasıl uyarlanacağını açıklamaktadır.

## 1. Rol Bazlı Yetkilendirme ve Kullanıcı Tipleri

Mobil uygulamamız temelde **Vatandaş** ve **Saha Ekibi** olmak üzere iki ana rol üzerinden şekillenecektir.

### Vatandaş (Citizen)
- **Yetkileri:**
  - Şehirdeki genel sorunları ve durumlarını harita/liste üzerinde görüntüleme.
  - Yeni sorun bildirme (Fotoğraf ve Konum destekli).
  - Kendi bildirdiği sorunların güncel durumunu takip etme.
  - Halka açık IoT sensör verilerini (Hava kalitesi, trafik yoğunluğu) görüntüleme.
- **Kısıtlamalar:**
  - Kendi oluşturmadığı sorunların detaylı denetim kayıtlarını (audit logs) göremez.
  - Sorunların durumlarını değiştiremez (Sadece "Bildirildi" statüsünde yeni kayıt açabilir).

### Saha Ekibi (Field Worker)
- **Yetkileri:**
  - Kendisine atanmış sorunları (görevleri) liste ve harita üzerinde görüntüleme.
  - Görev durumu güncelleme (İşlemde, Çözüldü vs.).
  - Çözüm aşamasında fotoğraf ekleme ve not düşme.
  - Ağ bağlantısının olmadığı alanlarda çevrimdışı (offline) işlem yapabilme.
- **Kısıtlamalar:**
  - Sistem yöneticisi yetkilerine sahip değildir (Sadece kendine atanan veya bölgeye ait kayıtları düzenleyebilir).

---

## 2. Ortak Veri Paylaşım Mimarisi (Web & Mobil)

Mobil uygulama, `web` tarafında kullanılan aynı Supabase projesine ve veritabanı şemalarına bağlanacaktır. Bu sayede web panelinden yapılan güncellemeler anında mobile, mobilden yapılan bildirimler anında web paneline yansıyacaktır.

- **`issues` Tablosu:**
  - Vatandaşlar `INSERT` işlemi ile yeni kayıt oluşturur.
  - Saha ekibi `UPDATE` işlemi ile mevcut kayıtların `status`, `resolved_at` gibi alanlarını günceller.
  - Gerçek zamanlı (Realtime) abonelik ile web ve mobil anlık eşitlenir.
- **`iot_sensors` Tablosu:**
  - Sadece okunabilir (Read-Only) erişim. IoT cihazlarından veya web panelinden gelen veriler mobil cihazlarda harita veya grafik bileşenleriyle gösterilir.
- **`audit_logs` Tablosu:**
  - Saha ekibinin sorun durumu değiştirmesi durumunda Edge Function veya veritabanı Trigger'ları vasıtasıyla denetim kaydı oluşturulur.
- **Supabase Storage:**
  - Sorun bildirim fotoğrafları (`issues_images` bucket vb.) ortak depolama alanına yüklenir, CDN üzerinden hem web hem de mobilde gösterilir.

---

## 3. Ekran Haritası ve Navigasyon Hiyerarşisi

Uygulama, React Navigation kullanılarak Stack ve Bottom Tab yapılarıyla tasarlanacaktır. Kullanıcı rolüne göre farklı Tab navigasyonları sunulacaktır.

### Root Stack
- **Splash Screen**
- **Auth Stack** (Login, Register)
- **Main App Stack** (Rol tabanlı yönlendirme)

### Vatandaş (Citizen) Bottom Tab Navigasyonu
1. **Ana Sayfa (Home Tab):** Genel özetler, en yakın sorunlar, duyurular.
2. **Harita (Map Tab):** Şehirdeki sorunların ve IoT sensörlerinin harita görünümü.
3. **Bildir (Report Tab):** Yeni sorun bildirim formu (Modal veya Stack içinde tam ekran).
4. **Sorunlarım (My Issues Tab):** Vatandaşın kendi bildirdiği sorunlar ve durum takibi.
5. **Profil (Profile Tab):** Ayarlar, bildirim tercihleri, çıkış yapma.

### Saha Ekibi (Field Worker) Bottom Tab Navigasyonu
1. **Görevler (Tasks Tab):** Atanan açık görevlerin listesi (Tarih, öncelik, uzaklık sıralı).
2. **Harita (Map Tab):** Görev yerleri ve rota desteği.
3. **Geçmiş (History Tab):** Çözümlenmiş veya kapatılmış görevlerin arşivi.
4. **Profil (Profile Tab):** Senkronizasyon durumu (Çevrimdışı mod bilgisi), çıkış yapma.

---

## 4. AI Vision ve IoT Servislerinin Mobile Uyarlanması

Web projesinde entegre edilen Akıllı Servisler (AI & IoT) doğrudan mobile taşınacaktır.

### AI Vision (Yapay Zeka Destekli Görüntü Analizi)
- **Akış:** Vatandaş mobil uygulamadan bir fotoğraf çekip yüklediğinde;
- Supabase Edge Functions tetiklenir veya özel bir API endpoint'ine istek atılır.
- Arka planda çalışan AI (Gemini Vision API vb.) resmi analiz eder.
- Analiz sonucu (Örn: Çukur tespiti, Grafiti tespiti, Hasarlı direk) `issues` tablosundaki `category` ve `ai_confidence_score` kolonlarına otomatik yazılır.
- Mobil cihazda kullanıcıya "Sistemimiz bu sorunu 'Altyapı - Çukur' olarak algıladı, onaylıyor musunuz?" şeklinde geri bildirim verilir.

### IoT Sensör Servisleri
- **Akış:** Şehrin farklı noktalarındaki IoT cihazlarından akan veriler;
- Supabase üzerindeki `iot_sensors` tablosunda güncellenir.
- Mobil uygulama, Supabase Realtime özelliğini kullanarak bu tabloyu dinler.
- Herhangi bir hava kalitesi sensörü kritik seviyeyi aştığında, harita üzerindeki marker rengi canlı olarak kırmızıya döner ve bölgedeki vatandaşlara "Push Notification" (Anlık Bildirim) gönderilir.
