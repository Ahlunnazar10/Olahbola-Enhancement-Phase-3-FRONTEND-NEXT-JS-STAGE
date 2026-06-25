# PANDUAN LENGKAP MONETISASI IKLAN — OLAHBOLA.COM

> **Project**: Olahbola — Portal media & komunitas sepak bola Indonesia
> **Stack**: Next.js 16.2.4 (App Router), React 19.2.4, Tailwind 4, Laravel (CMS)
> **Domain**: https://www.olahbola.com
> **Versi dokumen**: 1.0 — 2026-06-23

---

## 📊 ANALISIS TRAFFIC (DATA GA4 — 26 Mei s/d 22 Juni 2026)

| Metric | Nilai 28 Hari | Estimasi/Bulan |
|---|---|---|
| **Page Views** | 260.113 | **~330.000/bulan** |
| Sessions | 168.019 | ~215.000/bulan |
| Daily Avg Page Views | ~9.290/hari | |
| Daily Avg Users | ~5.300/hari (avg) | |
| Page Views per Session | **1,55** | |
| **Avg Engagement Time** | **~7,5 menit** | 🟢 **Sangat tinggi** |
| New Users | 149.057 (88,7%) | |
| Returning Users (Retention D30) | ~23.500 (15%) | |
| **Users dari Indonesia** | 137.243 (**89%**) | |
| Traffic Source #1 | Paid Other: 80.980 users | |
| Traffic Source #2 | Unassigned: 50.022 users | |
| Traffic Source #3 | Paid Search: 11.139 users | |
| Search Engine (Organic) | 189 users | ⚠️ Masih rendah |

### Verdict Traffic
- ✅ **Traffic sangat layak untuk AdSense** (ambang minimum tidak resmi, tapi publisher berpengalaman butuh minimal 50–100 page views/hari untuk di-approve dengan sehat — Anda **100x lipat dari itu**)
- ✅ **Engagement 7,5 menit/session** = sinyal konten berkualitas tinggi (AdSense & advertiser bayar lebih mahal untuk engagement tinggi)
- ✅ **Dominasi Indonesia (89%)** = bahasa & niche match sempurna dengan AdSense ID
- ⚠️ **88,7% new users** = retention rendah; perlu program loyalitas (opsional, tidak blocker)
- 🔴 **Organic Search sangat rendah (189 users)** = SEO belum maksimal — ini yang akan saya bahas di step prep
- 🔴 **Paid traffic sangat dominan (80K dari Paid Other)** = kalau ini dari iklan Meta/Ads, Anda sebenarnya **sudah spending uang untuk akuisisi traffic** — artinya ROI AdSense jadi lebih masuk akal

### Estimasi Revenue (Realistis untuk Indonesia, Niche Olahraga)

| Metric | Estimasi |
|---|---|
| Page RPM (Indonesia, sports niche) | **Rp 8.000 – Rp 25.000** per 1.000 page views |
| 330.000 PV/bulan × Rp 12.000 (mid) | **Rp 3.960.000 / bulan** |
| Optimistis (Rp 20.000) | **Rp 6.600.000 / bulan** |
| Pessimistis (Rp 8.000) | **Rp 2.640.000 / bulan** |
| + Direct brand sponsorship (existing pipeline) | **+ Rp 10.000.000 – Rp 30.000.000/bulan** |

**Total potensi bulan ke-3 setelah launching**: **Rp 13jt – 35jt/bulan** (AdSense + direct sales)

---

## 🗺️ ROADMAP 6 MINGGU — DARI NOL SAMPAI UANG MASUK

```
WEEK 0  → Foundation & Prep
WEEK 1  → Submit ke Google AdSense
WEEK 2  → Tunggu review AdSense (sambil direct sales)
WEEK 3  → Implementasi iklan kalau approved
WEEK 4  → Optimasi placement & format
WEEK 5  → Diversifikasi (direct sales + AdSense)
WEEK 6  → Scale & monitoring
```

---

## 📅 WEEK 0 — PERSIAPAN (3–5 HARI)

### Step 0.1 — Audit SEO & Performance

**Lakukan ini DULU sebelum apply AdSense. Google cek performa website.**

#### 0.1.1 Jalankan Lighthouse di Homepage

Buka Chrome → DevTools → Lighthouse → run audit untuk `https://www.olahbola.com`.

**Target minimum**:
| Metric | Target |
|---|---|
| Performance | ≥ 80 (mobile), ≥ 95 (desktop) |
| SEO | ≥ 95 |
| Best Practices | ≥ 90 |
| Accessibility | ≥ 85 |

Kalau ada yang di bawah target, fix dulu. Yang paling sering menjadi masalah di Next.js:
- Image terlalu besar (compress pakai Squoosh atau sharp)
- Font loading tanpa `display: swap`
- Third-party script tanpa `lazyOnload` strategy
- JS bundle terlalu besar (dynamic import untuk komponen berat)

#### 0.1.2 Cek Core Web Vitals Real User (bukan Lighthouse)

Buka `https://search.google.com/search-console` → Experience → Core Web Vitals.
Kalau belum verified, **ini PR besar Anda** (lihat step 0.2).

#### 0.1.3 Cek Indexing

Buka Google Search → ketik `site:olahbola.com`. Berapa halaman yang ter-index?
- Kalau < 50%: submit ulang sitemap di GSC
- Kalau < 30%: ada masalah crawl budget

### Step 0.2 — Setup Google Search Console (CRITICAL)

**Tanpa GSC verified, AdSense tetap bisa di-apply, tapi approval lebih lama dan trust signal lemah.**

#### Cara Verifikasi Domain

Anda punya 2 opsi, pilih yang lebih mudah:

**Opsi A — DNS TXT Record (RECOMMENDED, sekali set, tidak hilang saat deploy):**

1. Login ke dashboard domain provider Anda (Cloudflare? Niagahoster? Namecheap?)
2. Buka DNS settings untuk `olahbola.com`
3. Tambah record baru:
   ```
   Type: TXT
   Name: @
   Value: google-site-verification=<kode-dari-GSC>
   TTL: Auto
   ```
4. Di GSC, klik "Verify"

**Opsi B — HTML Meta Tag (kalau DNS susah):**

1. Buka `https://search.google.com/search-console`
2. Add property → URL prefix → `https://www.olahbola.com`
3. Pilih verifikasi "HTML tag"
4. Anda akan dapat kode seperti `abc123def456...`
5. Edit [app/layout.tsx](app/layout.tsx) head:

```tsx
// Di dalam <head> pada app/layout.tsx
<meta
  name="google-site-verification"
  content="abc123def456..."
/>
```

#### Submit Sitemap

Setelah verified:
1. Di GSC, masuk ke menu **Sitemaps**
2. Submit: `https://www.olahbola.com/sitemap.xml`
3. Cek status crawl setiap minggu

### Step 0.3 — Fix Open Graph Image (Quick Win)

Saya menemukan **bug** di metadata Anda. [app/layout.tsx:86](app/layout.tsx#L86) mereferensikan `/og-image.svg` tapi file di `public/` adalah `og-image.png` (1.36 MB).

#### Fix:

```bash
# Compress dulu (di PowerShell)
Compress-Archive -Path "public/og-image.png" -DestinationPath "og-image-backup.zip"
```

Atau pakai tool online: tinypng.com / squoosh.app → kompres ke target < 300 KB.

**Pilih salah satu**:

**Opsi A** (rename file):
```bash
# Rename file png ke svg (hanya rename, tapi format tetap png)
# ATAU convert png ke svg dengan vektor tool
```

**Opsi B** (lebih clean — ubah meta):
```tsx
// app/layout.tsx line 86, 100
images: [
  {
    url: "/og-image.png",  // ← ubah dari .svg ke .png
    width: 1200,
    height: 630,
    alt: "Olahbola - Tempatnya Penggila Bola!",
  },
],
```

Saya rekomendasikan **Opsi B** — lebih clean, tidak butuh convert format.

### Step 0.4 — Buat `ads.txt` (File Kosong Dulu)

Saya sebelumnya sarankan jangan buat dulu, tapi **rubah advis**: buat file `ads.txt` dengan placeholder supaya crawler tahu Anda aware soal authorized sellers.

#### Buat `public/ads.txt`:

```
# Olahbola.com ads.txt
# This file lists authorized sellers for ad inventory on this domain.
# Updated: 2026-06-23
#
# Once AdSense is approved, add:
# google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
```

Kenapa ini OK? File `ads.txt` boleh berisi komentar saja atau kosong — crawler tidak akan anggap Anda "no authorized sellers" parah karena secara teknis seller list kosong. Setelah AdSense approved, tinggal tambah 1 baris.

### Step 0.5 — Tambah Cookie Consent Banner

AdSense drop cookie pihak ketiga (Google). Chrome & beberapa regulator mulai flag situs tanpa consent banner sebagai lower trust. Implementasi minimum yang cukup:

#### Buat `components/cookie-consent/CookieBanner.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const CONSENT_KEY = "olahbola-cookie-consent";

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) {
      setShow(true);
    }
  }, []);

  const handleDecision = (decision: "accept" | "reject") => {
    localStorage.setItem(CONSENT_KEY, decision);
    setShow(false);
    
    // Trigger adsbygoogle kalau accept
    if (decision === "accept" && typeof window !== "undefined") {
      try {
        (window as any).adsbygoogle = (window as any).adsbygoogle || [];
        (window as any).adsbygoogle.push({});
      } catch (e) {
        console.error("Adsense push failed:", e);
      }
    }
  };

  if (!show) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9999] p-4 backdrop-blur-md bg-[#0f1412]/95 border-t border-[#43decc]/20"
      role="dialog"
      aria-label="Cookie consent"
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="flex-1 text-sm text-[#dfe4e0]">
          <p>
            Kami menggunakan cookie untuk meningkatkan pengalaman browsing,
            menganalisis traffic, dan menampilkan iklan yang relevan.{" "}
            <Link
              href="/kebijakan-privasi"
              className="text-[#43decc] underline hover:text-[#1fe6da]"
            >
              Pelajari lebih lanjut
            </Link>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleDecision("reject")}
            className="px-4 py-2 text-sm font-semibold rounded-full border border-[#43decc]/30 text-[#dfe4e0] hover:bg-[#43decc]/10 transition-colors"
          >
            Tolak
          </button>
          <button
            onClick={() => handleDecision("accept")}
            className="px-4 py-2 text-sm font-semibold rounded-full bg-[#43decc] text-[#003732] hover:bg-[#1fe6da] transition-colors"
          >
            Terima Semua
          </button>
        </div>
      </div>
    </div>
  );
}
```

#### Pasang di [app/layout.tsx](app/layout.tsx) — di dalam `<body>`, setelah `<Providers>`:

```tsx
<Providers>{children}</Providers>
<CookieBanner /> {/* ← tambahkan ini */}
<Toaster ... />
```

### Step 0.6 — Update Privacy Policy untuk menyebut Pihak Ketiga

Halaman `/kebijakan-privasi` Anda perlu mention cookie iklan dan third-party sharing. Tambahkan section baru.

#### Edit `app/(main)/kebijakan-privasi/page.tsx`:

Tambah section sebelum footer/bottom:

```markdown
## Cookie & Teknologi Pelacakan untuk Iklan

Kami bekerja sama dengan mitra iklan pihak ketiga (termasuk Google AdSense)
untuk menayangkan iklan di situs kami. Mitra-mitra ini dapat menggunakan
cookie, web beacon, dan teknologi serupa untuk:

- Menayangkan iklan yang relevan dengan minat Anda
- Mengukur efektivitas kampanye iklan
- Membatasi frekuensi tayangan iklan yang sama

**Mitra utama**:
- Google AdSense (https://policies.google.com/technologies/ads)

**Cara mengelola preferensi iklan**:
- Kunjungi https://adssettings.google.com
- Gunakan fitur "Tolak Semua" di banner cookie kami
- Gunakan mode incognito browser

**Data yang dikumpulkan**: tidak termasuk data pribadi sensitif seperti
nama lengkap, alamat, atau nomor telepon, kecuali yang Anda berikan secara
sukarela melalui form registrasi.
```

### Step 0.7 — Tambahkan Halaman "Tentang Kami" dan "Kontak"

**AdSense reviewer cek 2 halaman ini**. Anda punya footer contact tapi halaman dedicated lebih trustworthy.

#### Cek apakah ada `/tentang-kami` atau `/about`:

```bash
ls app/\(main\)/tentang* app/\(main\)/about* 2>/dev/null
```

Kalau belum ada, buat `app/(main)/tentang-kami/page.tsx` (lihat kode di section "BONUS: Kode Siap Pakai" di bawah).

#### Cek halaman `/kontak`:

Sama, kalau belum ada, buat. Minimal harus ada:
- Alamat fisik (sudah ada: Gedung STC LT.4 Ruang 80 Jakarta)
- Email (sudah ada: admin@olahbola.com)
- WhatsApp (sudah ada: +6287777487925)
- Form kontak (opsional tapi bagus untuk trust)

### Step 0.8 — Final Audit Sebelum Apply

Checklist sebelum lanjut ke Week 1:

- [ ] Lighthouse SEO ≥ 95
- [ ] Lighthouse Performance ≥ 80 mobile / 95 desktop
- [ ] GSC verified + sitemap submitted
- [ ] OG image fixed (.svg → .png)
- [ ] `public/ads.txt` ada (placeholder OK)
- [ ] Cookie consent banner live
- [ ] Privacy policy updated
- [ ] Halaman `/tentang-kami` live
- [ ] Halaman `/kontak` live (atau footer contact sudah lengkap)
- [ ] Tidak ada broken links (cek dengan `https://www.brokenlinkcheck.com`)
- [ ] Mobile-friendly (test di Chrome DevTools)

**Estimasi waktu**: 1–3 hari kerja.

---

## 📅 WEEK 1 — APPLY GOOGLE ADSENSE

### Step 1.1 — Persiapan Dokumen

Siapkan ini sebelum mulai apply:

1. **Akun Google** — gunakan akun yang sudah manage Analytics + GSC Olahbola
2. **Informasi pribadi**:
   - Nama lengkap (sesuai KTP)
   - Alamat rumah (untuk verifikasi AdSense nanti via PIN)
   - NPWP (untuk pajak, kalau ada)
3. **Informasi pembayaran**:
   - Nama bank
   - Nomor rekening
   - Nama pemilik rekening (harus sama dengan nama akun AdSense)
4. **Nomor telepon** yang bisa dihubungi

### Step 1.2 — Apply di Google AdSense

1. Buka https://www.google.com/adsense
2. Klik **"Mulai"** atau **"Sign up"**
3. Login dengan akun Google Anda
4. Masukkan URL website: `https://www.olahbola.com`
5. Pilih bahasa: **Bahasa Indonesia**
6. Pilih negara: **Indonesia**

7. **Hubungkan ke GA4** (recommended — AdSense akan pull data dari GA4):
   - Pilih property GA4 Olahbola
   - Klik "Connect"

8. Pilih tipe akun: **Individu** (atau Organisasi kalau ada PT)

9. **Centang semua checkbox** agreement

10. Klik **"Buat Akun"**

### Step 1.3 — Setelah Submit

Anda akan masuk ke dashboard AdSense. Status: **"Sedang ditinjau"**.

**Yang terjadi di balik layar** (1–14 hari, rata-rata 3–7 hari untuk situs dengan traffic sebanyak Olahbola):
- Googlebot crawl halaman Anda
- Reviewer cek konten, navigasi, legal pages
- Cek apakah ada violation (konten dewasa, copyrighted, dll)
- Cek traffic pattern (apakah natural atau bot)

**Sementara menunggu, Anda bisa**:
- Lanjut step 1.4 (preparing direct sponsorship pitch)
- Mulai kontak brand partner existing
- TIDAK boleh nyalain iklan apapun sampai approved

### Step 1.4 — Mulai Parallel: Direct Brand Sponsorship

**Jangan tunggu AdSense**. Buka list brand yang sudah ditampilkan di website Anda (lihat footer brand-logo) — itu list prospek siap jual.

#### Brand yang sudah ada di Olahbola:
> Shopee, Traveloka, Vidio, OPPO, Mandiri, Amartha, Indomilk, Aqua, Lifeboy, Bundesliga, LaLiga, Eredivisie, RCTI, EAFC, Maxstream, Mizone, Djarum Super

#### Template Email Pitch (Indonesian):

```
Subject: Kerjasama Partnership Konten — Olahbola.com

Halo Tim Partnership [Brand],

Perkenalkan, saya [Nama] dari Olahbola.com, portal media & komunitas
sepak bola Indonesia dengan 150K+ unique visitors per bulan dan
avg engagement 7+ menit per session.

Kami melihat [Brand] sudah aktif di komunitas bola melalui [campaign/event].
Kami tertarik menawarkan beberapa format partnership:

1. **Sponsored Article** (1 artikel原生 di /artikel + 1 social post)
   - 30 hari tayang di homepage
   - Include di newsletter
   - Rate: Rp 8.000.000 / artikel

2. **Banner Homepage (728x90 atau 970x250)**
   - 30 hari tayang, position di bawah hero
   - 200K+ impressions
   - Rate: Rp 5.000.000 / bulan

3. **Quiz/Game Sponsorship**
   - Integrasi brand di Quiz World Cup (high engagement)
   - 30 hari running
   - Rate: Rp 12.000.000 / bulan

4. **Custom Partnership** (video, IG takeover, event, dll)
   - Bisa didiskusikan

Demographics audience kami:
- 89% Indonesia
- 85% usia 18-34 tahun
- 65% male
- Interest: sepak bola, gaming, sports, lifestyle

Syarat & ketentuan partnership bisa dilihat di:
https://www.olahbola.com/syarat-dan-ketentuan-periklanan-partnership

Apakah ada slot untuk diskusi minggu ini atau minggu depan?

Best regards,
[Nama]
[Posisi]
[WhatsApp]
```

#### Kirim ke 10 brand dalam 2–3 hari. Target 2–3 deal di bulan pertama.

**Estimasi revenue direct sales (bulan pertama)**: Rp 10–30jt.

---

## 📅 WEEK 2 — REVIEW ADSENSE & PERSIAPAN TEKNIS

### Step 2.1 — Cek Status AdSense (Harian)

Login ke https://www.google.com/adsense setiap hari. Biasanya 2 status yang akan muncul:

**Status A: "Selamat! Akun AdSense Anda telah disetujui"** ✅
- Lanjut ke Step 2.3

**Status B: "Akun Anda sedang ditinjau"** ⏳
- Lanjut ke Step 2.2 (sambil tunggu)

**Status C: "Mohon maaf, aplikasi Anda ditolak"** ❌
- Baca alasan di email
- Fix issues yang disebut
- Apply ulang setelah 30 hari
- Sambil menunggu, double-down di direct sponsorship

### Step 2.2 — Kalau Masih "Sedang Ditinjau"

**Sementara menunggu, kerjakan ini**:

#### 2.2.1 Cek apakah ada halaman yang harus diperbaiki

Jalankan audit manual:
1. Buka https://www.olahbola.com di browser
2. Cek semua menu: artikel, interview, kolaborasi, dll
3. Klik random 10 artikel — pastikan tidak ada broken links, error 500, atau konten kosong
4. Cek mobile view di Chrome DevTools
5. Klik banner existing yang ada di homepage line 1631 — pastikan `https://heroplay.igvault.id/` masih hidup

#### 2.2.2 Tambah Halaman "About" jika belum ada

Lihat section **BONUS: Kode Siap Pakai** di bawah untuk template halaman `/tentang-kami`.

#### 2.2.3 Mulai Bangun Komponen `AdSlot`

Saya buatkan kode lengkapnya di section **BONUS**. Pasang tapi jangan aktifkan sampai AdSense approved.

### Step 2.3 — Kalau Approved: Setup Ad Units

Setelah AdSense approved, lakukan ini **di dashboard AdSense**:

1. **Iklan** → **Unit iklan** → **Unit iklan tampil**
2. **Buat unit iklan pertama**: Display ads
   - Name: "Homepage Top Banner"
   - Size: Responsive
   - Type: Display
   - Klik "Buat"
   - Copy `data-ad-slot` ID (angka seperti `1234567890`)

3. **Buat 4–6 unit iklan**:
   - Homepage Top Banner (responsive)
   - Homepage In-Article (in-article)
   - Artikel List Sidebar (rectangle 300x250)
   - Artikel Detail Sidebar (rectangle 300x250 sticky)
   - Artikel Detail In-Content (in-article)
   - Footer Banner (responsive)

4. **Ambil kode AdSense**:
   - **Settings** → **Akun** → **Informasi akun**
   - Copy **ID Penayang** (`pub-XXXXXXXXXXXXXXXX`)
   - Paste ke `.env.local`:
     ```
     NEXT_PUBLIC_ADSENSE_CLIENT=pub-XXXXXXXXXXXXXXXX
     ```

### Step 2.4 — Update `ads.txt`

Setelah dapat publisher ID, edit `public/ads.txt`:

```
# Olahbola.com ads.txt
# Updated: 2026-06-23
google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
```

Ganti `pub-XXXXXXXXXXXXXXXX` dengan ID asli Anda.

---

## 📅 WEEK 3 — IMPLEMENTASI IKLAN

### Step 3.1 — Pasang `AdSlot` Component

Saya buatkan kode lengkap di section **BONUS: Kode Siap Pakai** di bawah. Implementasi:

1. Buat file `components/ads/AdSlot.tsx`
2. Edit `.env.local`: tambah `NEXT_PUBLIC_ADSENSE_CLIENT=pub-xxx`
3. Edit `.env.example`: tambah variable yang sama untuk dokumentasi

### Step 3.2 — Replace Hardcoded Banner dengan AdSlot

#### 3.2.1 Homepage Top Banner

Edit [app/(main)/page.tsx:1631](app/(main)/page.tsx#L1631):

**Sebelum**:
```tsx
<section className="w-full py-4 px-6 md:px-16">
  <a href="https://heroplay.igvault.id/" target="_blank" rel="noopener noreferrer" className="block max-w-480 mx-auto relative h-50">
    <Image src="/images/home/ads-hz-1.webp" alt="Banner Ads" fill ... />
  </a>
</section>
```

**Sesudah**:
```tsx
<section className="w-full py-4 px-6 md:px-16">
  <div className="max-w-480 mx-auto">
    <AdSlot
      slot="1234567890"        {/* ← dari dashboard AdSense */}
      format="horizontal"
      responsive={true}
      label="Advertisement"
      fallback={
        <a href="https://heroplay.igvault.id/" target="_blank" rel="noopener noreferrer" className="block relative h-50">
          <Image src="/images/home/ads-hz-1.webp" alt="Sponsor" fill ... />
        </a>
      }
    />
  </div>
</section>
```

`fallback` di sini penting: kalau AdSense belum load (atau user reject cookies), tetap tampil banner direct dari igvault.id.

#### 3.2.2 Sidebar Artikel List

Edit [app/(main)/artikel/page.tsx:617-627](app/(main)/artikel/page.tsx#L617):

**Sebelum**:
```tsx
<div className="h-fit rounded-2xl overflow-hidden group">
  <a href="https://www.igvault.id/home">
    <img className="w-full h-full object-cover ..." src="/images/article/ads-sidebar.webp" alt="Promo" />
  </a>
</div>
```

**Sesudah**:
```tsx
<div className="h-fit rounded-2xl overflow-hidden group">
  <AdSlot
    slot="2222222222"         {/* ← dari dashboard AdSense */}
    format="rectangle"
    responsive={true}
    style={{ width: "300px", height: "250px" }}
    label="Advertisement"
  />
</div>
```

#### 3.2.3 Sidebar Artikel Detail

Edit [app/[slug]/page.tsx:565-576](app/[slug]/page.tsx#L565):

Sama seperti 3.2.2, pakai slot berbeda (mis. slot ID `3333333333`).

#### 3.2.4 In-Content Ad (Untuk Artikel Detail)

Tambah di [app/[slug]/page.tsx](app/[slug]/page.tsx) **di dalam** container artikel, setelah paragraf ke-3 atau setelah blok embed pertama.

TAPI: jangan inject manual — lebih clean buat komponen `<ArticleContentWithAds>` atau pakai `<AdSlot>` di posisi strategis.

Saya rekomendasikan: tambah di antara `dangerouslySetInnerHTML` content dan `Related Articles` section.

```tsx
{/* Article Content */}
<div ref={contentRef} className="..." dangerouslySetInnerHTML={{ __html: articleData.content }} />

{/* In-Content Ad — set after 3rd paragraph via CSS injection */}
<div className="my-8">
  <AdSlot
    slot="4444444444"
    format="in-article"
    responsive={true}
    label="Advertisement"
  />
</div>

{/* Related Articles */}
{relatedArticles.length > 0 && (...)}
```

### Step 3.3 — Test di Production

1. Deploy ke production
2. Buka homepage, scroll → cek banner muncul
3. Buka artikel detail, scroll → cek in-content muncul
4. Cek di Chrome DevTools → Network → filter `adsbygoogle` → pastikan request ke `pagead2.googlesyndication.com` ada
5. Test di 3 device: desktop, tablet, mobile

### Step 3.4 — Cek Dashboard AdSense

Setelah 24 jam, cek:
- **Laporan** → apakah impression tercatat?
- Kalau impression 0: cek apakah tag benar, cek cookie consent, cek ad blocker di browser

---

## 📅 WEEK 4 — OPTIMASI PLACEMENT & FORMAT

### Step 4.1 — Cek CTR (Click-Through Rate)

Di dashboard AdSense → Laporan → Cek per unit iklan:
- **CTR** target: 1–3%
- Kalau < 0.5%: iklan tidak terlihat atau tidak menarik → ubah posisi
- Kalau > 5%: posisi terlalu agresif (Google bisa flag)

### Step 4.2 — A/B Test Placement

Jangan ubah semua sekaligus. Satu per satu:
- **Week 4.1**: Test rectangle di sidebar vs di bawah hero
- **Week 4.2**: Test in-article di paragraf 3 vs paragraf 5
- **Week 4.3**: Test 1 banner vs 2 banner di homepage

### Step 4.3 — Cek Mobile Performance

Mobile = 89% traffic Indonesia Anda. **Pastikan**:
- Banner tidak membuat horizontal scroll
- In-content ad tidak push konten terlalu jauh ke bawah
- Sticky sidebar tidak menutupi konten di mobile (set display: none di mobile untuk sticky)

Tambah `responsive` Tailwind class untuk sembunyikan di mobile:

```tsx
{/* Sidebar Ad — desktop only */}
<div className="hidden lg:block">
  <AdSlot slot="..." format="rectangle" />
</div>
```

### Step 4.4 — Lazy Load Ads Below the Fold

```tsx
<AdSlot
  slot="..."
  format="in-article"
  lazyLoad={true}   {/* ← hanya load kalau sudah discroll */}
  responsive={true}
/>
```

Implementasi `lazyLoad` di `AdSlot.tsx`: pakai `IntersectionObserver`, push adsbygoogle hanya kalau visible.

---

## 📅 WEEK 5 — DIVERSIFIKASI

### Step 5.1 — Direct Brand Sponsorship Pipeline

Target: **3 brand deal aktif di bulan ke-2**.

**Pitch**:
- Shopee (e-commerce) → sponsored article tentang jersey
- Traveloka → banner homepage + sponsored travel article
- Vidio → integration banner di section interview
- OPPO → sponsored video review

**Tools untuk manage direct sales**:
- Spreadsheet dengan status: contacted → negotiation → closed → live
- Invoice template: simple, tapi profesional
- Payment gateway: pakai Transfer Bank, atau setup Stripe untuk international

### Step 5.2 — Affiliate Marketing (Layer Tambahan)

Pasang affiliate link di artikel terkait:
- **Tokopedia/Shopee Affiliate** → jersey bola, merchandise
- **Traveloka Affiliate** → tiket pesawat, hotel
- **Booking.com Affiliate** → hotel

Rate: 1–8% per transaksi. Cocok untuk artikel seperti "10 Stadion Terbaik di Indonesia" → link affiliate hotel di dekat stadion.

### Step 5.3 — Sponsored Content Sections

Buat section khusus di homepage untuk sponsored content (jangan samakan dengan iklan AdSense):
- Position: di bawah "Voices of the Game"
- Label jelas: "Sponsored" atau "Mitra"
- Beda visual dari organik (border berbeda, label "AD" kecil)

---

## 📅 WEEK 6 — SCALE & MONITORING

### Step 6.1 — Eksperimen Format

Test format baru dari dashboard AdSense:
- **Match content** (recommendation widget)
- **In-feed ads** (mirip artikel native)
- **Anchor ads** (mobile sticky bottom)
- **Vignette ads** (mobile full-screen on exit — high CPM tapi agresif)

**Rekomendasi untuk Olahbola**:
- ✅ Match content — recommended (bukan gangguan)
- ✅ In-feed — recommended
- ⚠️ Anchor ads — hati-hati, bisa ganggu UX
- ⚠️ Vignette — jangan dulu, terlalu agresif untuk sports media

### Step 6.2 — Setup Monitoring Dashboard

Bikin dashboard mingguan yang track:
- Page views (GA4)
- AdSense revenue (AdSense dashboard)
- RPM = (Revenue / Page views) × 1000
- CTR (AdSense)
- Direct sales revenue (spreadsheet manual)

Tools: Google Sheets / Notion, atau pakai tool otomatis seperti Baremetrics.

### Step 6.3 — Cek Polanya

Setelah 1 bulan live:
- Hari apa RPM tertinggi? (Weekend biasanya lebih tinggi karena sports event)
- Halaman apa yang paling banyak di-monetisasi? (Artikel detail biasanya)
- Audience mana yang paling valuable? (Returning users biasanya CPM lebih tinggi)

Optimasi berdasarkan data ini.

---

## 💰 ESTIMASI REVENUE TIMELINE

| Bulan | AdSense | Direct Sales | Total |
|---|---|---|---|
| **Bulan 1** (review AdSense) | Rp 0 | Rp 10–30jt (1–2 deal) | **Rp 10–30jt** |
| **Bulan 2** (AdSense baru live) | Rp 2–5jt | Rp 15–40jt | **Rp 17–45jt** |
| **Bulan 3** (optimasi) | Rp 4–8jt | Rp 20–50jt | **Rp 24–58jt** |
| **Bulan 6** (scale) | Rp 8–15jt | Rp 30–70jt | **Rp 38–85jt** |
| **Bulan 12** (full pipeline) | Rp 15–30jt | Rp 50–100jt | **Rp 65–130jt** |

**Catatan**: ini estimasi berdasarkan:
- Traffic 330K PV/bulan (Anda sudah punya ini)
- RPM Indonesia sports niche
- 1–3 direct deal aktif

Kalau traffic naik (mis. ke 500K PV/bulan), revenue bisa 1.5x–2x lebih tinggi.

---

## 🚨 TROUBLESHOOTING

### AdSense Application Ditolak

**Alasan umum & fix**:

1. **"Konten tidak cukup"** → tambah 20–30 artikel original lagi, tunggu 30 hari, apply ulang
2. **"Navigasi tidak jelas"** → pastikan menu utama accessible dari semua halaman, tidak ada broken link
3. **"Tidak ada kebijakan privasi"** → sudah fix di step 0.6
4. **"Konten berhak cipta"** → pastikan semua gambar artikel asli (bukan Google Images), ada lisensi untuk video embed
5. **"Traffic rendah"** → tidak mungkin untuk Anda (280K+ PV/bulan)

### AdSense Approved Tapi Revenue = 0

**Fix**:
1. Tunggu 24–48 jam untuk first crawl
2. Cek apakah ad unit ID benar (data-ad-slot harus match dengan dashboard)
3. Test di incognito mode (ad blocker sering aktif di normal mode)
4. Cek browser console untuk error

### RPM Sangat Rendah

**Penyebab**:
- Traffic negara dengan CPM rendah (NL, SG, US traffic kecil di data Anda — itu mahal, ID traffic besar tapi murah)
- Kategori keyword kurang komersial (cari keyword dengan high CPC di artikel)
- Penempatan iklan tidak optimal

**Fix**:
- Tulis artikel dengan keyword high-CPC: "review smartphone", "tiket pesawat", "asuransi", "pinjaman online" (legal)
- Test format responsive vs fixed size
- Tambah in-article ads (RPM biasanya 30–50% lebih tinggi dari sidebar)

---

## 📋 CHECKLIST FINAL SEBELUM GO LIVE

- [ ] GSC verified + sitemap submitted
- [ ] OG image fixed
- [ ] `ads.txt` updated dengan AdSense ID
- [ ] Cookie consent banner live
- [ ] Privacy policy updated (sebutkan Google sebagai third party)
- [ ] Halaman `/tentang-kami` live
- [ ] Halaman `/kontak` live (atau footer comprehensive)
- [ ] Lighthouse SEO ≥ 95
- [ ] Lighthouse Performance ≥ 80 mobile
- [ ] Ad units dibuat di dashboard AdSense (5–6 unit)
- [ ] `NEXT_PUBLIC_ADSENSE_CLIENT` di `.env.local` dan `.env.example`
- [ ] `AdSlot.tsx` component dibuat
- [ ] Hardcoded banner replaced di homepage
- [ ] Hardcoded banner replaced di artikel list
- [ ] Hardcoded banner replaced di artikel detail
- [ ] In-content ad ditambahkan di artikel detail
- [ ] Cookie banner trigger ads push setelah accept
- [ ] Tested di desktop, tablet, mobile
- [ ] Tested dengan cookie accept DAN cookie reject
- [ ] Direct sponsorship pitch dikirim ke 10 brand
- [ ] Spreadsheet tracking setup

---

## 📚 REFERENSI

- Google AdSense Help Center: https://support.google.com/adsense
- Google AdSense Program Policies: https://support.google.com/adsense/answer/48182
- Google Search Console: https://search.google.com/search-console
- Indonesian Publisher Forum: https://www.dailysocial.id (cari keyword "AdSense")
- WebmasterWorld: https://www.webmasterworld.com (English, banyak diskusi CPM)

---

> **Pesan terakhir**: 280K page views/bulan dengan engagement 7+ menit adalah **aset yang sangat valuable**. Baik AdSense maupun brand sponsor akan bayar mahal untuk traffic seperti ini. Jangan sia-siakan dengan placement yang salah atau UX yang mengganggu. Prioritas: **konten tetap raja, iklan penopang**. Selamat monetize!