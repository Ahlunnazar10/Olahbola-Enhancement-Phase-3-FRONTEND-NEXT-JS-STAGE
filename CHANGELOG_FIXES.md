# CHANGELOG FIXES — Olahbola

### Fix #1 — teamsMap.forEach is not a function
Tanggal: 2026-08-27
File: `hooks/queries/useBundesliga.ts` (line 154, 118, 136)
Masalah: `typeof teamsData !== "array"` karena API return `{success:true,data:[...]}` tapi hook ambil `response.data` langsung.
Akar: Response wrapper Laravel tidak di-unpack.
Fix: Tambah `Array.isArray(response.data) ? response.data : response.data?.data ?? []` di `useTeams`, `useMatches`, `useLeaderboard`, `useMyPredictions`.
Verifikasi: TypeError hilang, page load normal.
Pelajaran: Cek format response API sebelum akses data.
Log Keyword: forEach is not a function / teamsData
Deploy: ✅ LIVE

### Fix #2 — Prediction button stuck locked setelah login
Tanggal: 2026-08-27
File: `app/(main)/prediksi-skor-2026-2027/page.tsx` (line 650)
Masalah: Button "Pertandingan Terkunci" muncul padahal `is_prediction_open: true` dan user sudah login.
Akar: `isAuthenticated` dari zustand persist bisa false saat SSR pertama, menyebabkan tombol selalu disabled sebelum client-side hydration selesai.
Fix: Tambah state `isAuthReady` (useState false → useEffect set true). Gunakan `isAuthReady && isAuthenticated` di `isEditable`.
Verifikasi: Button aktif setelah login.
Pelajaran: Zustand persist butuh waktu load, jangan andalkan langsung di render condition.
Log Keyword: Pertandingan Terkunci / isEditable
Deploy: ✅ LIVE

---
*Format: entri baru di paling atas. Nomor urut tidak boleh diulang.*
