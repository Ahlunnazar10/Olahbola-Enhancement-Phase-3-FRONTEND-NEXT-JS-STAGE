@AGENTS.md
Selalu jelaskan semua rencana, kode, analisis, dan langkah-langkah dalam Bahasa Indonesia yang baik, natural, dan mudah dipahami.

# Olahbola — Developer & Learning Guide

## Profil Proyek

Olahbola adalah platform konten sepak bola Indonesia (news, quiz, prediksi skor, leaderboard, interview, kolaborasi). Target audiens: penggemar sepak bola Indonesia. Live di `https://www.olahbola.com`.

## Tech Stack

- **Framework:** Next.js 16 App Router (React 19)
- **Bahasa:** TypeScript (strict mode aktif)
- **Styling:** Tailwind CSS v4 + `clsx` + `tailwind-merge` (fungsi `cn()` di [lib/utils.ts](lib/utils.ts))
- **State Client:** Zustand + `persist` middleware (localStorage)
- **Server State:** TanStack React Query (staleTime 60s, retry 1x)
- **API Client:** Axios (interceptor CSRF + auth) + native `fetch` untuk auth API
- **Backend:** Laravel Sanctum (CORS, CSRF cookie-based)
- **Notifikasi:** react-hot-toast (root layout) + sonner (dalam Providers)
- **Routing:** Next.js App Router dengan route groups `(main)` dan `(auth)`
- **SEO:** Metadata API, JSON-LD structured data, sitemap, robots.txt
- **Analytics:** Google Analytics 4 + Vercel Analytics + GTM (lazy-loaded)
- **Ads:** Google AdSense (lazy-loaded via component)
- **Ikon:** Lucide React
- **Animasi:** GSAP (`@gsap/react`), CSS keyframes native
- **Carousel:** Swiper
- **Toast/Notification:** Sonner (UI store), react-hot-toast (auth)
- **Testing/Perf:** Playwright, Lighthouse

## Arsitektur Kode

### Struktur Direktori

```
app/
  (main)/         → Route group tanpa layout wrapper
  (auth)/         → Route group halaman autentikasi
  api/            → Next.js API Routes (proxy ke Laravel)
components/
  layouts/        → NaviBar, Footer
  article/        → Card artikel
  seo/            → SEO components (JsonLd, SeoHead, scripts)
  games/          → Komponen game/quiz
  banner-slider/  → Hero banner carousel
  cookie-banner/  → GDPR consent
hooks/
  queries/        → React Query hooks (useAuth, useArticles, useQuiz, dll)
lib/
  api/            → apiClient (axios), endpoints, auth fetch
  utils/          → cn, formatDate, truncate, getImageUrl, dll
  analytics.ts    → GA4 helpers
  seo.ts          → SEO helpers
  security.ts     → Devtools blocker (prod only)
stores/           → Zustand stores (authStore, uiStore)
types/            → TypeScript interfaces (User, Article, Quiz, dll)
```

### Pola Penulisan Kode

**1. Komponen Halaman (Page Components)**

- Selalu `"use client"` di baris pertama jika memakai state/hooks
- Gunakan `useMemo` untuk data komputasi (leaderboard rows, banner slides)
- Gunakan `useInView` dari `react-intersection-observer` untuk lazy-fetch sections
- Loading skeleton untuk setiap async section
- Dark/light mode mengikuti `theme` dari `useUIStore` (default: `'dark'`)
- Warna tema utama: teal `#43decc` (light) / `#0a7c6e` (dark), bg `#0f1412` (dark) / `#f5f5f5` (light)

**2. React Query Hooks** (`hooks/queries/`)

- Export function hooks: `useArticles`, `useArticleDetail`, `useQuiz`, dll
- Selalu define interface lokal untuk response API (bukan re-export dari `types/`)
- Gunakan `staleTime` 5-10 menit untuk data statis
- `enabled: !!slug` untuk query conditional
- Pagination via query params di `queryKey`

**3. Zustand Stores** (`stores/`)

- `authStore`: user, isAuthenticated, accessToken — persist ke localStorage via `createJSONStorage`
- `uiStore`: theme (dark/light), mobile menu, modals, toasts — persist hanya `theme`
- Semua store pakai `'use client'` directive

**4. API Client** (`lib/api/client.ts`)

- Axios instance dengan interceptors: auto-attach CSRF token + Bearer token
- Retry otomatis untuk 401/419 (CSRF expired) → refresh token → retry request
- Auth API pakai pure `fetch` (bukan axios) karena masalah CORS berbeda
- Semua auth flows login/register/logout → Next.js API Routes (`/api/auth/*`), TIDAK langsung ke Laravel

**5. SEO & Metadata**

- Root layout: metadata default + fonts preload + GTM + AdSense scripts (lazy)
- Halaman individual: `<SeoHead>` component + JSON-LD inline script
- Sitemap dinamis di `app/sitemap.ts`
- Middleware: cache headers (static 1 tahun, HTML 60s) + security headers

**6. TypeScript Patterns**

- Strict mode aktif (`"strict": true` dalam tsconfig)
- Path alias `@/*` → root direktori
- Interface untuk semua tipe data (lihat [types/index.ts](types/index.ts))
- `any` type hanya di tempat terbatas (misal: mapping artikel populer)

### Standar UI/UX

- **Glassmorphism:** `glass-panel` / `glass-card` class dengan backdrop-blur, border transparan
- **Neon effects:** `neon-border`, `neon-text` dengan glow teal
- **Typography:** Uppercase + italic-bold untuk headings ("italic-bold" CSS class)
- **Responsive:** Mobile-first dengan breakpoint md (768px) dan lg (1024px)
- **Lottie animations** untuk loading states tertentu
- **Interaksi hover:** scale + translateX transitions pada card/list items

### Perilaku & Konvensi Tambahan

- Semua teks respons dan penjelasan WAJIB dalam Bahasa Indonesia
- Jangan tambahkan fitur yang tidak diminta secara eksplisit
- Jaga konsistensi warna tema (teal primary, dark/light variants)
- Untuk gambar: selalu gunakan `@/lib/utils.getImageUrl()` atau `getProfilePictureUrl()`
- Untuk tanggal: selalu gunakan `@/lib.utils.formatDate()` atau `formatRelativeTime()`
- Hindari console.log di produksi — hapus logging debugging setelah fitur selesai
- Setiap halaman baru harus punya `metadata.ts` (untuk SEO metadata)
- Semua page di `(main)` mengikuti layout: NavigationBar → main content → Footer
- Theme toggle floating di kanan bawah (komponen `ThemeToggle`)

### API & Environment

- Backend: Laravel di `https://cms.olahbola.com` (prod) / `http://127.0.0.1:8000` (dev)
- HeroPlay (external game API): `https://api.mainhero.id`
- Selalu cek `.env` dan `.env.example` untuk variabel yang tersedia
- Gambar dari CMS prefix: `${NEXT_PUBLIC_API_URL}/storage/${path}`

### Commit Message Convention

Gunakan format: `Feat: <deskripsi>` atau `Fix: <deskripsi>` (capital F/X)
Contoh dari repo:

- `Feat: Update olahbola icon & logo on search engine`
- `Fix: Layout bugs on quiz page`
- `perf: Lighthouse optimization mobile 85+ desktop 87+`

### Hal yang Perlu Diperhatikan

- Next.js 16 memiliki breaking changes — selalu cek docs di `node_modules/next/dist/docs/`
- CORS: browser langsung ke Laravel blocked → selalu proxy via Next.js API routes untuk auth
- CSRF token dikelola otomatis di axios interceptor (Sanctum)
- `unoptimized: true` di dev mode untuk Next.js images (tidak perlu convert)
- Image optimization: webp only, AVIF supported

# Konteks & Peran

Saya adalah Frontend Developer yang sedang mengerjakan project berbasis Next.js (kadang juga menyentuh backend Laravel/MongoDB). Saya belajar sambil coding — jadi saya butuh penjelasan yang membangun pemahaman, bukan cuma solusi instan.

# Bahasa & Gaya Komunikasi

- Selalu jelaskan semua rencana, kode, analisis, dan langkah-langkah dalam Bahasa Indonesia yang baik, natural, dan mudah dipahami.
- Hindari bahasa yang kaku/terlalu formal ala terjemahan mesin. Gunakan gaya yang enak dibaca, seperti developer senior menjelaskan ke rekan tim.
- Hindari istilah teknis tanpa penjelasan. Kalau terpaksa pakai istilah Inggris (karena memang istilah baku di dunia coding, misal "hook", "state", "props"), boleh dipakai apa adanya tanpa dipaksa diterjemahkan, tapi tetap beri konteks singkat kalau istilahnya baru pertama kali muncul.
- Kode, nama variabel, command, path file, dan pesan error TETAP dalam bahasa aslinya (Inggris/sesuai konvensi) — jangan diterjemahkan.

# Prinsip "Belajar Sambil Coding"

- Setiap kali memberi solusi, jelaskan **kenapa** solusi itu dipilih, bukan cuma **apa** yang harus ditulis.
- Kalau ada beberapa pendekatan yang mungkin, sebutkan trade-off-nya secara singkat (misal: Server Component vs Client Component, kapan pakai `useEffect` vs tidak perlu sama sekali).
- Kalau saya menulis kode yang kurang tepat, jelaskan letak masalahnya sebelum kasih perbaikan — jangan langsung timpa tanpa penjelasan.
- Untuk konsep baru (misal App Router, Server Actions, Middleware), beri analogi sederhana dulu sebelum masuk ke detail teknis.

# Next.js — Preferensi Teknis

- Default menggunakan App Router (bukan Pages Router) kecuali saya sebutkan sebaliknya.
- Prioritaskan Server Components; jelaskan alasan spesifik kalau memang perlu `"use client"`.
- Perhatikan best practice performa: image optimization (`next/image`), font optimization, code splitting, caching strategy (`fetch` cache, revalidate).
- Kalau relevan, singgung juga sisi SEO (metadata API, dynamic sitemap) karena project berbasis konten publik.
- Sesuaikan contoh dengan versi Next.js & React yang sedang dipakai di project — kalau tidak yakin versinya, cek `package.json` dulu sebelum kasih saran.

# Konteks Project (Olahbola)

- Stack: Next.js (frontend), Laravel 12 (backend API & Admin CMS), MongoDB, Cloudflare (CDN/analytics/security), Xendit (payment gateway).
- Saat menjelaskan integrasi frontend-backend, asumsikan backend berbasis Laravel REST API kecuali disebutkan lain.
- Copywriting/UI text yang customer-facing menyasar audiens Gen-Z Indonesia — tone percaya diri, spesifik, tidak generic/robotik.

# Format Jawaban

- Jawaban to the point dulu (ringkasan solusi), baru diikuti penjelasan detail/step-by-step.
- Untuk perubahan kode, tunjukkan bagian yang diubah secara jelas (jangan tempel ulang seluruh file kalau perubahannya kecil).
- Kalau langkahnya banyak, pecah jadi list bernomor supaya gampang diikuti.
- Kalau ada risiko/downside dari suatu pendekatan (misal: breaking change, isu keamanan, dampak performa), sebutkan secara eksplisit — jangan disembunyikan demi kelihatan simpel.
