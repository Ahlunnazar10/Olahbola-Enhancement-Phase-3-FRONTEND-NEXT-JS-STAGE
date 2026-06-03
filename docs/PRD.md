# PRD — Olahbola Frontend (Next.js)

> **Project**: Olahbola.com — Frontend website media & komunitas sepak bola Indonesia
> **Versi PRD**: 1.0
> **Tanggal**: 2026-06-02
> **Status**: Aktif
> **Pemilik Produk**: Tim Olahbola
> **Repositori**: `e:\DEVELOPER\NEXT\olahbola`

---

## 1. Ringkasan Produk (Product Overview)

**Olahbola** adalah website frontend berbasis Next.js yang berfungsi sebagai hub media, komunitas, dan permainan (gamifikasi) untuk pencinta sepak bola — khususnya sepak bola Eropa dan Timnas Indonesia. Konten dikurasi dengan semangat **"From fans, by fans, for sport lovers everywhere"** dan disajikan dalam dua mode tema: **Dark (default)** dan **Light**.

Situs ini mengonsumsi data dari **Laravel Backend API** (CMS Olahbola), serta menyediakan fitur interaktif seperti kuis, prediksi skor (Football City Battle), dan sistem sapa komunitas. Aplikasi di-host di **Vercel** dengan **Cloudflare** sebagai DNS, dan menggunakan **GitHub** sebagai version control.

### 1.1 Tujuan Produk
- Menjadi pusat informasi dan hiburan sepak bola berbahasa Indonesia.
- Meningkatkan engagement pengguna lewat kuis, prediksi skor, dan konten eksklusif.
- Mempertahankan performa tinggi (Lighthouse desktop 99/92/100/100; mobile 68/100/96/100) untuk SEO & UX.

### 1.2 Audiens / Persona
| Persona | Deskripsi | Kebutuhan Utama |
|---|---|---|
| **Football Enthusiast** | Pecinta sepak bola usia 16–35, cari berita, opini, dan hiburan. | Artikel cepat, kuis, prediksi skor |
| **Quiz Gamer** | Pengguna yang gemar tantangan kuis harian/musiman. | Kuis bertingkat, leaderboard, hadiah |
| **Prediction Pro** | Prediktor skor yang ingin bersaing di leaderboard. | Prediksi skor resmi, poin, ranking |
| **Brand / Partner** | Ingin berkolaborasi konten atau iklan. | Halaman kolaborasi, syarat partnership |
| **Member Terdaftar** | Pengguna yang login untuk akses personal (profil, poin). | Autentikasi, profil, leaderboard personal |

---

## 2. Struktur Produk (Product Structure)

### 2.1 Tech Stack
| Layer | Teknologi |
|---|---|
| **Framework** | Next.js `16.2.4` (App Router) — ⚠️ *custom Next.js dengan breaking changes, lihat `AGENTS.md`* |
| **UI Library** | React `19.2.4` |
| **Bahasa** | TypeScript `5` (strict mode) |
| **Styling** | Tailwind CSS `4` (via `@tailwindcss/postcss`) |
| **State Management** | Zustand `5.0` (auth + UI stores) |
| **Data Fetching** | TanStack React Query `5.99` |
| **HTTP Client** | Axios `1.15` |
| **Animation** | GSAP React `2.1`, Lottie Player `3.6` |
| **Carousel/Swiper** | Swiper `12.1` |
| **Icons** | Lucide React `1.8` |
| **Notifications** | React Hot Toast, Sonner |
| **Auth CSRF** | Sanctum (Laravel) lewat Next.js API route |
| **Analytics** | Vercel Analytics, Google Analytics, Google Tag Manager |
| **Translate Widget** | Google Translate (komponen internal) |
| **Intersection Observer** | `react-intersection-observer` |
| **UI Helpers** | `@headlessui/react`, `clsx`, `tailwind-merge` |
| **Hosting** | Vercel (frontend) + Cloudflare (DNS) |
| **Backend** | Laravel API (`https://cms.olahbola.com`) |
| **Version Control** | GitHub |

### 2.2 Struktur Direktori (App Router)
```
e:\DEVELOPER\NEXT\olahbola\
├── app/
│   ├── (auth)/                  # Auth pages (login, register, callback, verify-email)
│   ├── (main)/                  # Main group — layout dengan Footer + NavigationBar
│   │   ├── artikel/             # Daftar + detail artikel
│   │   │   ├── [slug]/          # Detail artikel
│   │   │   ├── kategori/[slug]/ # Artikel per kategori
│   │   │   └── page.tsx         # Listing
│   │   ├── interview/           # Halaman + detail interview
│   │   ├── kolaborasi/          # Halaman + detail kolaborasi brand
│   │   ├── quiz/                # Kuis utama + level
│   │   ├── quiz-image/          # Kuis tebak gambar
│   │   ├── quiz-spesial-hari-raya/ # Kuis event khusus
│   │   ├── prediksi-skor/       # ⚽ Football City Battle
│   │   ├── games/               # Hub games
│   │   ├── sapa/                # Sapa komunitas
│   │   ├── journey/             # Journey Olahbola
│   │   ├── media-spotlight/     # Sorotan media
│   │   ├── profile/             # Profil user
│   │   ├── kebijakan-privasi/   # Halaman legal
│   │   ├── kebijakan-hak-cipta/
│   │   ├── syarat-dan-ketentuan-*/  # 3 halaman S&K
│   │   ├── page.tsx             # 🏠 Homepage (Kickoff)
│   │   └── layout.tsx
│   ├── [slug]/                  # Dynamic page (CMS-driven)
│   ├── api/                     # Next.js API routes (proxy ke Laravel)
│   │   ├── auth/                # login, register, logout, google, verify-email, resend-verification
│   │   └── heroplay/leaderboard # Internal API
│   ├── auth/google/             # OAuth Google callback
│   ├── verify-email/            # Email verification success
│   ├── layout.tsx               # Root layout
│   ├── not-found.tsx
│   ├── sitemap.ts               # SEO sitemap (revalidate 1 jam)
│   ├── robots.ts                # SEO robots
│   └── globals.css
├── components/
│   ├── Providers.tsx            # Global providers
│   ├── layouts/                 # NavigationBar, Footer
│   ├── article/                 # ArticleCard, ArticleHomeCard, CategoryListCard, PopularArticleCard
│   ├── banner-slider/           # BannerSlider
│   ├── games/                   # (kosong, placeholder)
│   ├── quiz/                    # (kosong, placeholder)
│   ├── seo/                     # SeoHead, SeoScripts, JsonLd, SchemaServer, dll
│   ├── theme-toggle/            # ThemeToggle (dark/light)
│   ├── embed/                   # FacebookEmbed, InstagramEmbed, TwitterEmbed, EmbedProcessor
│   ├── GoogleTranslate/         # Widget translate
│   └── icons/                   # Custom icon set
├── hooks/queries/               # React Query hooks
│   ├── useArticles.ts
│   ├── useAuth.ts
│   ├── useContent.ts
│   ├── useLeaderboard.ts
│   ├── usePredictions.ts
│   ├── useProfile.ts
│   └── useQuiz.ts
├── lib/
│   ├── api/                     # client.ts (axios), endpoints.ts
│   ├── auth/                    # csrf, csrf-server, google
│   ├── utils/                   # formatDate, formatNumber, translate-manager, translate-cleanup
│   ├── seo.ts                   # SEO helpers
│   ├── analytics.ts             # Event tracking
│   └── utils.ts
├── stores/
│   ├── authStore.ts             # Zustand: user, token, login/logout
│   ├── uiStore.ts               # Zustand: theme (dark/light), ui state
│   └── index.ts
├── types/index.ts               # TypeScript types (User, ApiResponse, Leaderboard, dll)
├── data/indonesianCities.ts     # Data statis (dropdown kota)
├── public/                      # images/, icons/, sounds/
└── docs/PRD.md                  # 📄 Dokumen ini
```

### 2.3 Domain Fitur (Feature Map)
1. **Artikel** — listing, detail, kategori, pencarian
2. **Interview** — listing, detail (video + embed)
3. **Kolaborasi** — listing, detail brand partner
4. **Kuis** — 3 varian: kuis utama, tebak gambar, kuis hari raya
5. **Prediksi Skor (Football City Battle)** — liga/match/fase, submit prediksi, leaderboard
6. **Games Hub** — direktori semua game
7. **Sapa** — pesan komunitas
8. **Journey** — tentang Olahbola
9. **Media Spotlight** — sorotan media eksternal
10. **Autentikasi** — login, register, Google OAuth, verifikasi email
11. **Profil** — profil user terotentikasi
12. **Legal** — 3 halaman S&K + 2 halaman kebijakan
13. **Dynamic CMS Page** — `[slug]` page dari Laravel CMS
14. **SEO Global** — sitemap, robots, JSON-LD, OG tags, GTM, GA
15. **Theme Toggle** — dark/light
16. **Translate Widget** — Google Translate embedded

---

## 3. User Flow

### 3.1 Flow Pengunjung Anonim (Guest)
```
[Landing Homepage /] 
    │
    ├──> Banner slider, Artikel populer, Highlight Kuis, Highlight Prediksi
    │
    ├──> NavBar ──> Artikel, Interview, Kolaborasi, Sapa, Journey, Quiz, Games
    │
    ├──> [Guest] Click "Daftar" / "Login" ──> /login atau /register
    │       ├──> Google OAuth ──> /auth/google/callback ──> /
    │       └──> Email/password ──> /verify-email ──> /verify-email/success
    │
    ├──> Read Artikel ──> /artikel ──> /artikel/[slug] (SEO Article schema)
    │
    ├──> Watch Interview ──> /interview ──> /interview/[slug] (VideoObject schema)
    │
    ├──> Explore Kuis (tanpa login) ──> /quiz ──> /quiz/[level] ──> /quiz/play
    │
    ├──> Explore Prediksi Skor ──> /prediksi-skor (read-only / leaderboard publik)
    │       └──> "Login dulu untuk submit prediksi" CTA
    │
    ├──> Footer ──> Halaman legal, Sapa, Kontak (WA, email, lokasi)
    │
    └──> Search engine (Google) ──> Rich Results (Article / VideoObject)
```

### 3.2 Flow Member Terotentikasi
```
[Login sukses]
    │
    ├──> Profile sync via /sanctum/csrf-cookie + GET /user
    │
    ├──> Prediksi Skor ──> /prediksi-skor
    │       ├──> Lihat jadwal match (live/scheduled/completed)
    │       ├──> Submit prediksi (jika belum lewat deadline)
    │       ├──> Lihat prediksi saya + status poin
    │       └──> Lihat leaderboard publik + rank saya
    │
    ├──> Quiz ──> /quiz/[level] ──> jawab soal ──> submit skor
    │       └──> Lihat leaderboard per level
    │
    └──> Profile ──> /profile ──> data diri, total poin, edit profil, logout
```

### 3.3 Flow Admin/Kontributor (via CMS, di luar scope frontend)
> Catatan: Pembuatan konten dilakukan lewat **Laravel CMS** (`cms.olahbola.com`) — bukan melalui frontend.

### 3.4 Flow SEO (Crawler / Googlebot)
```
Googlebot ──> https://www.olahbola.com/sitemap.xml (auto-generated, revalidate 1 jam)
            │
            └──> /robots.txt (allow + sitemap reference)
            │
            └──> Crawl halaman ──> baca JSON-LD inline (Article, VideoObject, WebSite, Organization)
                    │
                    ├──> Homepage: WebSite + Organization
                    ├──> /artikel/[slug]: Article (headline, author, publisher, image)
                    └──> /interview/[slug]: VideoObject (thumbnail, uploadDate, embedUrl)
```

---

## 4. Requirements

### 4.1 Functional Requirements

#### FR-1: Homepage (Kickoff)
- FR-1.1 — Banner slider (Swiper) + highlight artikel/quiz/prediksi
- FR-1.2 — Section "Artikel Populer" + "Artikel Terbaru"
- FR-1.3 — CTA "Daftar Sekarang" dengan GTM tracking
- FR-1.4 — Hero "GTM CTA" button dengan tracking

#### FR-2: Artikel
- FR-2.1 — List artikel dengan pagination (page, per_page)
- FR-2.2 — Detail artikel (slug-based)
- FR-2.3 — Filter per kategori (`/artikel/kategori/[slug]`)
- FR-2.4 — Search artikel
- FR-2.5 — Sidebar "Artikel Populer" di detail
- FR-2.6 — JSON-LD `Article` schema (inline SSR)
- FR-2.7 — Share button (Web Share API + clipboard fallback)
- FR-2.8 — Related articles berdasarkan kategori

#### FR-3: Interview
- FR-3.1 — List interview dengan pagination (Bento grid + Load More)
- FR-3.2 — Detail interview dengan embed video (Twitter/Instagram/Facebook)
- FR-3.3 — JSON-LD `VideoObject` schema
- FR-3.4 — "Glass panel" + "glowing border" theme

#### FR-4: Kolaborasi
- FR-4.1 — List kolaborasi brand partner
- FR-4.2 — Detail kolaborasi dengan link eksternal

#### FR-5: Kuis
- FR-5.1 — Kuis utama bertingkat (`/quiz`, `/quiz/[level]`, `/quiz/play`)
- FR-5.2 — Kuis tebak gambar (`/quiz-image`, `/quiz-image/play`)
- FR-5.3 — Kuis spesial hari raya (`/quiz-spesial-hari-raya/[eventId]`, `/play`)
- FR-5.4 — Leaderboard per level

#### FR-6: Prediksi Skor (Football City Battle)
- FR-6.1 — List phase (group, knockout, dll)
- FR-6.2 — List match per phase/group/matchday
- FR-6.3 — Submit prediksi (home/away score) — *protected, butuh auth*
- FR-6.4 — Status: scheduled / live / completed / locked
- FR-6.5 — User rank & summary (poin, akurasi, exact scores)
- FR-6.6 — Public leaderboard (top N) di `/games`
- FR-6.7 — Auto-invalidate query setelah submit
- FR-6.8 — Deadline enforcement (lock prediksi jika lewat waktu)

#### FR-7: Games Hub (`/games`)
- FR-7.1 — Direktori semua game (kuis + prediksi)
- FR-7.2 — Tampilkan leaderboard publik prediksi

#### FR-8: Sapa
- FR-8.1 — Tampilkan pesan komunitas (read-only)
- FR-8.2 — Featured message

#### FR-9: Journey
- FR-9.1 — Timeline perjalanan Olahbola

#### FR-10: Media Spotlight
- FR-10.1 — Showcase liputan media eksternal

#### FR-11: Autentikasi
- FR-11.1 — Register (email/password)
- FR-11.2 — Login (email/phone + password)
- FR-11.3 — Google OAuth (lewat Next.js API route)
- FR-11.4 — Verifikasi email (token via email)
- FR-11.5 — Resend verifikasi
- FR-11.6 — Logout (clear Zustand + localStorage)
- FR-11.7 — CSRF Sanctum (cookie-based)

#### FR-12: Profile
- FR-12.1 — Lihat profil sendiri
- FR-12.2 — Edit profil
- FR-12.3 — Logout

#### FR-13: Halaman Legal
- FR-13.1 — Kebijakan Privasi
- FR-13.2 — Kebijakan Hak Cipta
- FR-13.3 — S&K Penggunaan
- FR-13.4 — S&K Football City Battle
- FR-13.5 — S&K Periklanan & Partnership

#### FR-14: Dynamic CMS Page
- FR-14.1 — Route `/[slug]` membaca halaman dari Laravel CMS

#### FR-15: SEO Global
- FR-15.1 — `sitemap.xml` otomatis (revalidate 1 jam)
- FR-15.2 — `robots.txt`
- FR-15.3 — JSON-LD inline (WebSite, Organization, Article, VideoObject)
- FR-15.4 — OG tags & Twitter Card
- FR-15.5 — Canonical URL `https://www.olahbola.com`

#### FR-16: Analytics & Tracking
- FR-16.1 — Google Tag Manager (GTM)
- FR-16.2 — Google Analytics 4
- FR-16.3 — Vercel Analytics
- FR-16.4 — Custom event tracking (`lib/analytics.ts`)

#### FR-17: Theme & UX
- FR-17.1 — Theme toggle (dark/light) via `uiStore` (Zustand)
- FR-17.2 — Persist theme preference
- FR-17.3 — Smooth transition antara tema

#### FR-18: Translasi
- FR-18.1 — Google Translate widget (embedded)
- FR-18.2 — Pembersihan DOM translate (`translate-cleanup.ts`)

### 4.2 Non-Functional Requirements

#### NFR-1: Performa
- **NFR-1.1** — Pertahankan Lighthouse desktop: **99 Performance, 92 Accessibility, 100 Best Practices, 100 SEO**
- **NFR-1.2** — Target mobile: naikkan dari 68 ke **≥ 80 Performance**, pertahankan 100 A11y/96 BP/100 SEO
- **NFR-1.3** — First Contentful Paint < 1.5s di 4G
- **NFR-1.4** — Largest Contentful Paint < 2.5s
- **NFR-1.5** — Cumulative Layout Shift < 0.1
- **NFR-1.6** — Time to Interactive < 3.5s

#### NFR-2: SEO
- **NFR-2.1** — Semua halaman punya metadata unik (title, description, OG, canonical)
- **NFR-2.2** — JSON-LD valid & ter-render di SSR (bukan client-only)
- **NFR-2.3** — `sitemap.xml` selalu ter-update (revalidate 1 jam)
- **NFR-2.4** — `robots.txt` allow publik + reference sitemap
- **NFR-2.5** — Domain konsisten: `https://www.olahbola.com` (dengan www)
- **NFR-2.6** — Submit sitemap ke Google Search Console

#### NFR-3: Aksesibilitas (A11y)
- **NFR-3.1** — Lighthouse Accessibility ≥ 92 (desktop) / 100 (mobile)
- **NFR-3.2** — Semantic HTML (header, main, article, aside, footer, nav)
- **NFR-3.3** — Alt text pada semua image
- **NFR-3.4** — Focus visible untuk keyboard navigation
- **NFR-3.5** — Color contrast ratio ≥ 4.5:1

#### NFR-4: Keamanan
- **NFR-4.1** — CSRF token via Sanctum cookie
- **NFR-4.2** — Auth token disimpan di localStorage (existing) + header Bearer
- **NFR-4.3** — Semua mutation melalui Next.js API route (proxy) bukan direct Laravel
- **NFR-4.4** — Halaman legal tersedia
- **NFR-4.5** — `.env` tidak di-commit (lihat `.gitignore`)

#### NFR-5: Skalabilitas
- **NFR-5.1** — `staleTime` optimal di React Query:
  - Artikel: 5–10 menit
  - Match prediksi: 30 detik
  - Leaderboard: 1 menit
  - Phase/team: 1 jam
- **NFR-5.2** — Image dioptimasi via Next.js Image + AVIF/WebP
- **NFR-5.3** — Code splitting per route (otomatis App Router)

#### NFR-6: Dual Mode (Dark/Light)
- **NFR-6.1** — Default theme: **dark**
- **NFR-6.2** — Setiap halaman baru harus mendukung kedua mode
- **NFR-6.3** — Transisi halus (`transition-colors duration-300`)
- **NFR-6.4** — Color tokens: primary teal `#43decc` / `#0a7c6e`, dengan variant tema

#### NFR-7: Browser & Device Support
- **NFR-7.1** — Modern evergreen browsers (Chrome, Edge, Firefox, Safari terbaru)
- **NFR-7.2** — Responsive: mobile ≥ 320px, tablet, desktop ≥ 1920px
- **NFR-7.3** — Touch-friendly tap targets ≥ 44x44px

#### NFR-8: Reliability
- **NFR-8.1** — Graceful error handling (skeleton loader, error boundary)
- **NFR-8.2** — `notFound()` untuk slug tidak valid
- **NFR-8.3** — Toast notification (sonner / react-hot-toast) untuk feedback

---

## 5. Scope Project

### 5.1 In-Scope (Termasuk)
✅ Semua halaman statis & dinamis di bawah `(main)/` route group
✅ Autentikasi lengkap (login, register, Google OAuth, verifikasi email)
✅ Kuis 3 varian (main, image, spesial hari raya) dengan leaderboard
✅ Prediksi Skor (Football City Battle) — submit, match, leaderboard
✅ SEO: sitemap, robots, JSON-LD, OG tags
✅ Theme toggle (dark/light) dengan persistensi
✅ Google Translate widget
✅ Analytics: GA4, GTM, Vercel
✅ Sitemap otomatis dari data Laravel
✅ Pagination, search, dan filter artikel
✅ Halaman legal & kebijakan
✅ Embed processor untuk Twitter/Instagram/Facebook
✅ Next.js API routes sebagai proxy ke Laravel (auth flow)

### 5.2 Out-of-Scope (Tidak Termasuk)
❌ **CMS / Admin panel** — dilakukan di Laravel (`cms.olahbola.com`)
❌ **Backend API** — sepenuhnya di Laravel, frontend hanya consume
❌ **Push notification** (belum ada)
❌ **Real-time live match commentary** (placeholder)
❌ **Payment gateway** (kuis/prediksi gratis untuk saat ini)
❌ **Native mobile app** (web responsif sudah cukup)
❌ **i18n penuh** (cuma widget Google Translate)
❌ **Video hosting** — interview embed dari platform eksternal

### 5.3 Future / Backlog (Tidak Prioritas Saat Ini)
- 🔄 Server-side rendering (SSR) untuk semua halaman; saat ini kebanyakan client component
- 🔄 Image CDN (saat ini dari Laravel `cms.olahbola.com`)
- 🔄 PWA / offline support
- 🔄 Push notification untuk event prediksi
- 🔄 Integrasi WhatsApp Business Chat (tercantum di requirement awal, belum diimplementasi di kode)
- 🔄 Personalized recommendation untuk artikel
- 🔄 Advanced analytics dashboard

---

## 6. Panduan Implementasi (Untuk Tim)

### 6.1 Prinsip Utama
1. **Performance first** — setiap PR wajib menjaga skor Lighthouse
2. **SEO first** — setiap halaman baru harus JSON-LD + metadata
3. **Dual mode** — dark (default) + light, dengan transisi halus
4. **Skeleton loader** — wajib saat fetch data
5. **Server JSON-LD** — render inline (bukan `useEffect` mounted)

### 6.2 Aturan Adding Halaman Baru
1. Buat folder di `app/(main)/[nama-fitur]/`
2. Bungkus query data dengan React Query (`hooks/queries/`)
3. Pakai `<SeoHead>` + inline JSON-LD
4. Tambahkan `dynamic = "force-static"` / `revalidate` jika perlu
5. Update `app/sitemap.ts` untuk rute statis baru
6. Pastikan dark & light mode berfungsi
7. Test di mobile & desktop Lighthouse

### 6.3 ⚠️ Catatan Penting
- **AGENTS.md**: Versi Next.js yang dipakai adalah **custom/breaking** — baca `node_modules/next/dist/docs/` sebelum pakai API baru
- **CSRF**: Selalu lewat Next.js API route (`/api/auth/...`) — JANGAN panggil Laravel langsung untuk mutation
- **Token**: Disimpan di Zustand + `localStorage` (key: `auth_token` & `auth-storage`)
- **Image domains**: Sudah di-whitelist di `next.config.ts` (cms.olahbola.com, googleusercontent, dll)

---

## 7. Acceptance Criteria

| Fitur | Kriteria |
|---|---|
| Homepage | Render < 2s di 4G, JSON-LD valid |
| Artikel | JSON-LD Article detected di Rich Results Test |
| Interview | JSON-LD VideoObject detected |
| Prediksi Skor | Submit → leaderboard update real-time |
| Auth | Login → token tersimpan → `/profile` accessible |
| Kuis | Jawab soal → submit → leaderboard update |
| Theme Toggle | Default dark, switch tanpa flash |
| Sitemap | `https://www.olahbola.com/sitemap.xml` accessible, revalidate 1 jam |
| Lighthouse Desktop | 99 / 92 / 100 / 100 |
| Lighthouse Mobile | Target ≥ 80 / 100 / 96 / 100 |

---

## 8. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| API Laravel lambat | Loading lama | React Query cache + skeleton + SWR fallback |
| Lighthouse mobile turun | SEO & UX drop | Image optimization, code split, defer non-critical JS |
| CSRF mismatch | Login gagal | Centralized di Next.js API route |
| Theme flicker saat load | UX jelek | Theme script di `<head>` root layout |
| Bundle size membengkak | Performance drop | Lazy import Swiper, Lottie, GSAP |

---

*Dokumen ini adalah sumber kebenaran tunggal untuk produk Olahbola Frontend. Setiap perubahan fitur besar harus memperbarui PRD ini.*
