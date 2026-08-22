# SmartCity Mobil Uygulama Yol Haritası (Gün 21 - 40)

Bu doküman, SmartCity projesinin ikinci yarısını oluşturan mobil geliştirme fazının (Gün 21 - 40) adım adım planını, kullanılacak teknoloji yığınını ve modül dağılımını içermektedir.

## Teknoloji Yığını
- **Framework:** React Native & Expo
- **Stil / Tasarım:** NativeWind (Tailwind CSS)
- **Navigasyon:** React Navigation
- **Veri ve Backend:** Supabase JS (Web projesiyle ortak veritabanı)
- **Harita:** react-native-maps
- **Bildirimler:** Expo Push Notifications
- **Çevrimdışı Depolama:** AsyncStorage / MMKV

## Günlük Planlama (Gün 21 - 40)

### Hafta 1: Altyapı, Navigasyon ve Kimlik Doğrulama
- **Gün 21:** Mobil Faz Mimarisi, Ekran Akışları ve Dokümantasyon Planlaması
- **Gün 22:** Expo Proje Kurulumu, Klasör Yapısı ve NativeWind Entegrasyonu
- **Gün 23:** React Navigation ile Uygulama İçi Yönlendirmelerin ve Tab hiyerarşisinin Kurulması
- **Gün 24:** Supabase JS Entegrasyonu, Ortak Veritabanı Bağlantısı ve Authentication (Giriş/Kayıt)
- **Gün 25:** Ortak UI Bileşenlerinin (Component) Geliştirilmesi (Buton, Input, Modal, Header)

### Hafta 2: Vatandaş Rolü Geliştirmeleri (Sorun Bildirim ve AI)
- **Gün 26:** Vatandaş Ana Ekranı (Dashboard) Tasarımı ve Özet Bilgilerin Gösterimi
- **Gün 27:** Sorun Bildirme Formu: Kamera/Galeri İzinleri ve Supabase Storage'a Görsel Yükleme
- **Gün 28:** AI Vision Entegrasyonu: Yüklenen fotoğrafın Edge Functions üzerinden yapay zeka ile analizi (Kategori/Öncelik tahmini)
- **Gün 29:** Konum Servisleri (GPS) ve Harita (Map) Üzerinde Sorun İşaretleme
- **Gün 30:** Vatandaşın Kendi Bildirdiği Sorunları Listelemesi ve Detay Görünümü

### Hafta 3: Saha Ekibi Rolü ve Çevrimdışı Destek
- **Gün 31:** Saha Ekibi Ana Ekranı: Atanan Görevler ve Harita Üzerindeki Konumları
- **Gün 32:** Saha Ekibi Görev Detayı, Fotoğraf Ekleyerek Durum Güncelleme (Çözüldü, İşlemde vb.)
- **Gün 33:** Çevrimdışı (Offline) Kullanım Desteği: Yerel depolama (MMKV) ile mevcut görevlerin önbelleğe alınması
- **Gün 34:** Çevrimdışı Yapılan İşlemlerin İnternet Bağlantısı Sağlandığında Supabase ile Senkronizasyonu
- **Gün 35:** IoT Sensörleri İzleme (Vatandaş ve Saha Ekibi için): Haritada sensör durumlarını ve metrikleri canlı gösterme

### Hafta 4: Bildirimler, Performans ve Yayınlama
- **Gün 36:** Gerçek Zamanlı Veri (Realtime Subscription): Sorun/Sensör güncellemelerinin anında ekrana yansıması
- **Gün 37:** Expo Push Notifications: Sorun çözüldüğünde vatandaşa, yeni görev atandığında saha ekibine bildirim gönderilmesi
- **Gün 38:** Performans İyileştirmeleri, Hata Ayıklama (Error Logging) ve Son UI/UX Rötuşları
- **Gün 39:** Uçtan Uca (E2E) Testler ve Cihaz Testleri (iOS/Android simülatör ve gerçek cihazlar)
- **Gün 40:** EAS Build ile App Store (TestFlight) ve Google Play (Internal Track) Dağıtım Hazırlıkları ve Derleme

---
*Not: Bu yol haritası proje gereksinimlerine göre esneklik gösterebilir, mobil uygulama geliştirimi tamamen `web/` klasörünün dışında, `mobile/` kök dizininde yürütülecektir.*
