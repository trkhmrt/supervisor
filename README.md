# Süpervizyon Platformu

Ruh sağlığı profesyonelleri için bireysel/grup/akran süpervizyonu ve görüşme simülasyonu hizmetleri sunan tam fonksiyonlu bir web platformu.

## Özellikler

### Public Site
- **Anasayfa** — Hero, hizmetler, süpervizörler, blog, bülten
- **Hizmet Sayfaları** — Bireysel, Grup, Akran Süpervizyonu ve Görüşme Simülasyonu
- **Abdullatif R. Çelik Sipariş Sayfası** — `/hizmetler/bireysel-supervizyon` adresinde özel sipariş kartı + canlı randevu takvimi
- **Süpervizör Listesi & Profili** — Foto, bio, uzmanlık, ücret, müsaitlik takvimi, yorumlar
- **Randevu Sistemi** — Tarih/saat seçimi, ödeme bekleme akışı, otomatik Google Meet linki, iptal/yeniden planlama
- **Blog** — Liste, detay, kategori filtresi, sosyal paylaşım butonları (Twitter/Facebook/LinkedIn)
- **Hakkımızda & İletişim** — İletişim formu admin paneline akar
- **SEO** — Tüm sayfalarda metadata, OpenGraph, Twitter Card

### Kimlik Doğrulama
- **İki tip kayıt**: Süpervizyon Alan (ücretsiz) ve Süpervizör (sadece davet linki ile)
- **E-posta doğrulama akışı** (mock)
- **Süpervizör daveti** — Admin tarafından e-posta + benzersiz token ile oluşturulur

### Kullanıcı Paneli
- Yaklaşan & geçmiş randevular
- Google Meet'e tek tıkla katılma
- Randevu iptal
- Profil görünümü

### Admin Paneli
- **Genel Bakış (Dashboard)** — KPI'lar, son randevular, gelir, hızlı işlemler
- **Randevular** — Tablo, filtre, arama, ödeme onayı (Meet linki otomatik üretilir), iptal
- **Kullanıcılar** — Liste, e-posta doğrulama yönetimi
- **Süpervizörler** — Davet gönderme, davet linki kopyalama, mevcut süpervizör listesi
- **Hizmetler** — İçerik, fiyat, özellik, slug düzenleme; aktif/pasif toggle
- **Blog** — Yazı oluşturma, düzenleme, taslak/yayınla, silme (modal editor)
- **Mesajlar & Bülten** — İletişim formu mesajları, bülten aboneleri (CSV export)
- **Ayarlar** — Site adı, slogan, iletişim bilgileri, sosyal medya linkleri

## Teknoloji

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** — Sıcak (sand) + teal renk paleti
- **Fraunces** (display) + **Inter** (sans) — Google Fonts
- **Zustand** + persist middleware — State management + localStorage
- **lucide-react** — Icon set
- **date-fns** — Date utilities

## Çalıştırma

```bash
npm install
npm run dev
```

http://localhost:3000

### Demo hesaplar

| Rol | E-posta | Şifre |
|---|---|---|
| Admin | admin@supervizyon.com | admin123 |
| Süpervizör | abdullatif@supervizyon.com | supervisor123 |
| Süpervizyon Alan | zeynep@example.com | demo1234 |

### Demo davet linki

`/davet/demo-invite-token` — Süpervizör olarak kayıt akışını test edebilirsiniz.

## Mimari Notlar

- **Mock veri katmanı** (`lib/mockData.ts`) — Tüm başlangıç verisi burada
- **Zustand store** (`lib/store.ts`) — Tüm CRUD işlemleri, `localStorage` üzerinden kalıcı
- **Admin tarafından yapılan tüm değişiklikler anında public sayfalara yansır** (hizmet fiyatları, blog yazıları, ayarlar vb.)
- **`skipHydration`** — Persist middleware sunucu/istemci uyumsuzluğunu önlemek için manuel rehydration kullanır (`components/StoreHydration.tsx`)

## Yapı

```
app/                       # Next.js App Router
  page.tsx                # Anasayfa
  hizmetler/[slug]/       # Dinamik hizmet sayfası (bireysel için özel kart)
  supervizorler/[id]/     # Süpervizör profili + randevu
  blog/[slug]/            # Blog detay
  giris, kayit, davet/[token]/
  panelim/                # Kullanıcı paneli
  admin/                  # Admin paneli (8 alt sayfa)
components/
  site/                   # Public site bileşenleri (Header, Footer, BookingPanel, ...)
  admin/                  # Admin shell + ortak bileşenler
lib/
  types.ts                # Tüm tip tanımları
  mockData.ts             # Başlangıç verisi
  store.ts                # Zustand store
  utils.ts                # Yardımcı fonksiyonlar (formatPrice, slugify, Meet link...)
public/images/
  abdullatif.png          # Yer tutucu portre (AI üretimi)
```

## Üretime Geçiş İçin

Bu prototip mock veriyle çalışıyor. Üretime alırken:

1. **Veritabanı**: Prisma + PostgreSQL/Supabase ekleyin. `lib/store.ts` içindeki CRUD fonksiyonlarını server actions/API route'larına dönüştürün.
2. **Auth**: NextAuth veya Clerk entegre edin. Şifreler bcrypt ile hashlenmeli.
3. **Ödeme**: iyzico, Stripe veya PayTR. Admin "Ödeme Onayla" yerine otomatik webhook akışı.
4. **Google Meet**: Google Workspace API ile otomatik link oluşturma + takvim daveti.
5. **E-posta**: Resend veya SendGrid ile gerçek e-posta doğrulama + bildirimler.
6. **Foto upload**: UploadThing veya S3.
7. **`public/images/abdullatif.png`**: Yer tutucudur. Gerçek fotoğrafla değiştirin.
# supervisor
