# 🏆 World Cup 2026 Prediction API - Dokumentasi

## Base URL
```
http://127.0.0.1:8000/api/v1/world-cup
```

## Aturan Poin

| Kondisi | Poin |
|---------|------|
| Skor tepat (skor + pemenang benar) | **10 poin** |
| Pemenang benar tapi skor salah | **5 poin** |
| Salah (pemenang berbeda) | **0 poin** |

### Contoh Perhitungan:
1. **Ahlun menebak Argentina 2-1 Portugal**
   - Hasil akhir Argentina 2-1 Portugal ✅
   - **Skor tepat + pemenang benar = 10 poin**

2. **Ahlun menebak Argentina 2-1 Portugal**
   - Hasil akhir Argentina 3-2 Portugal ✅
   - Pemenang benar, skor tidak tepat
   - **Pemenang benar = 5 poin**

3. **Ahlun menebak Argentina 2-1 Portugal**
   - Hasil akhir Portugal 2-1 Argentina ❌
   - Pemenang salah
   - **0 poin**

---

## 📋 Daftar API

### PUBLIC (Tanpa Auth)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/phases` | Semua fase tournament |
| GET | `/teams` | Semua tim |
| GET | `/teams?grouped=true` | Tim dikelompokkan per grup |
| GET | `/matches` | Daftar pertandingan |
| GET | `/matches?phase=group_stage` | Match fase grup |
| GET | `/matches?phase=group_stage&group=A&matchday=1` | Match grup A matchday 1 |
| GET | `/matches/{id}` | Detail match + statistik |
| GET | `/leaderboard` | Leaderboard keseluruhan |

---

### PROTECTED (Butuh Auth: Bearer Token)

#### 1. GET MY PREDICTIONS
```
GET /predictions
GET /predictions?phase_id=xxx
GET /predictions?upcoming_only=true
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "xxx",
      "match": {
        "home_team": {"name": "Argentina"},
        "away_team": {"name": "Portugal"},
        "match_date": "2026-06-12"
      },
      "home_score_predicted": 2,
      "away_score_predicted": 1,
      "predicted_team": "Argentina",
      "predicted_result_label": "home_win",
      "result_correct": null,
      "score_exact": null,
      "points_earned": 0,
      "status": "pending",
      "is_editable": true
    }
  ],
  "summary": {
    "total_points": 45,
    "total_predictions": 10,
    "exact_scores": 3,
    "winner_correct": 6,
    "accuracy": 60.0
  }
}
```

---

#### 2. GET MATCHES WITH PREDICTION
```
GET /matches-with-prediction?phase=group_stage&group=A
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "xxx",
      "home_team": {"name": "Meksiko"},
      "away_team": {"name": "Afrika Selatan"},
      "match_date": "2026-06-12",
      "is_prediction_open": true,
      "user_prediction": {
        "home_score_predicted": 2,
        "away_score_predicted": 1,
        "predicted_team": "Meksiko",
        "is_editable": true
      }
    }
  ]
}
```

---

#### 3. POST PREDICT (Simpan Prediksi - 1 Form Saja)
```
POST /predict

Body:
{
  "match_id": "xxx",
  "home_score_predicted": 2,
  "away_score_predicted": 1
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Prediksi berhasil disimpan",
  "data": {
    "predicted_team": "Argentina",
    "predicted_result_label": "home_win"
  }
}
```

**Catatan:**
- User cukup input skor saja
- Backend otomatis menentukan tim yang dipilih berdasarkan skor
- Jika skor 2-1 → `predicted_team = "Argentina"`
- Jika skor 1-2 → `predicted_team = "Portugal"`
- Jika skor 1-1 → `predicted_team = "Seri"`

---

#### 4. GET MY RANK
```
GET /me/rank
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "rank": 15,
    "total_points": 45,
    "total_participants": 500
  }
}
```

---

#### 5. GET MY SUMMARY
```
GET /me/summary
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "total_points": 45,
    "total_predictions": 10,
    "exact_scores": 3,
    "winner_correct": 6,
    "pending_predictions": 5,
    "accuracy": 60.0,
    "live_rank": 15,
    "total_participants": 500
  }
}
```

---

### PUBLISH (Admin/Backend)

#### POST PUBLISH SCORES
```
POST /publish/scores

Body:
{
  "match_id": "xxx",
  "home_score": 2,
  "away_score": 1
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Skor berhasil dipublish dan poin dihitung",
  "data": {
    "match": {
      "home_team": {"name": "Argentina"},
      "away_team": {"name": "Portugal"},
      "home_score": 2,
      "away_score": 1,
      "status": "completed"
    },
    "predictions_calculated": 1500,
    "total_points_distributed": 8500
  }
}
```

---

## 🔄 Alur Kerja Lengkap

```
1. User melihat jadwal
   GET /matches?phase=group_stage

2. User memilih match dan input skor
   POST /predict
   Body: { "match_id": "xxx", "home_score_predicted": 2, "away_score_predicted": 1 }

   → Backend otomatis mencatat: Ahlun memilih "Argentina"

3. Admin/Backend mempublish skor
   POST /publish/scores
   Body: { "match_id": "xxx", "home_score": 2, "away_score": 1 }

   → Sistem menghitung poin:
   - Skor tepat → 10 poin
   - Pemenang benar → 5 poin
   - Salah → 0 poin

4. User cek hasil
   GET /predictions
   GET /me/rank
```

---

## 🖥️ Simulasi Flow Frontend (Lengkap)

### 📌 ASUMSI
- User sudah **login** dan punya Bearer Token
- Matchday 1 Group Stage sudah tersedia
- User: **Ahlun** (user_id: `user_123`)

---

### STEP 1: User Membuka Halaman Prediksi

#### 🔵 Frontend Request: Ambil Semua Fase
```
GET /api/v1/world-cup/phases
```
**Response:**
```json
{
  "status": "success",
  "data": [
    { "id": "phase_1", "name": "Group Stage", "key": "group_stage", "order": 1 },
    { "id": "phase_2", "name": "Round of 16", "key": "round_of_16", "order": 2 },
    { "id": "phase_3", "name": "Quarter Final", "key": "quarter_final", "order": 3 },
    { "id": "phase_4", "name": "Semi Final", "key": "semi_final", "order": 4 },
    { "id": "phase_5", "name": "Third Place", "key": "third_place", "order": 5 },
    { "id": "phase_6", "name": "Final", "key": "final", "order": 6 }
  ]
}
```

---

### STEP 2: User Memilih Fase Group Stage

#### 🔵 Frontend Request: Ambil Semua Tim (Grouped)
```
GET /api/v1/world-cup/teams?grouped=true
```
**Response:**
```json
{
  "status": "success",
  "data": {
    "A": [
      { "id": "team_1", "name": "Argentina", "group": "A", "flag": "🇦🇷" },
      { "id": "team_2", "name": "Meksiko", "group": "A", "flag": "🇲🇽" },
      { "id": "team_3", "name": "Afrika Selatan", "group": "A", "flag": "🇿🇦" },
      { "id": "team_4", "name": "Polandia", "group": "A", "flag": "🇵🇱" }
    ],
    "B": [...],
    "C": [...],
    "D": [...],
    "E": [...],
    "F": [...],
    "G": [...],
    "H": [...]
  }
}
```

#### 🎨 Frontend Render:
```
┌─────────────────────────────────────────────┐
│  🏆 WORLD CUP 2026 PREDICTION                │
├─────────────────────────────────────────────┤
│  📅 Group Stage - Matchday 1                 │
├─────────────────────────────────────────────┤
│  GRUP A                                     │
│  ┌─────────────────────────────────────────┐ │
│  │ 🇦🇷 Argentina  vs  🇲🇽 Meksiko          │ │
│  │         12 Jun 2026 - 01:00 WIB         │ │
│  │  [INPUT SKOR]  ?  -  ?                   │ │
│  │  [PILIH GRUP A] [PREDIKSI SEKARANG]     │ │
│  └─────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────┐ │
│  │ 🇿🇦 Afrika Selatan  vs  🇵🇱 Polonia    │ │
│  │         12 Jun 2026 - 07:00 WIB         │ │
│  │  [INPUT SKOR]  ?  -  ?                   │ │
│  └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│  GRUP B                                     │
│  ...                                        │
└─────────────────────────────────────────────┘
```

---

### STEP 3: User Mengisi Prediksi - Argentina vs Meksiko

#### 🎨 Frontend Form:
```
┌─────────────────────────────────────────┐
│        🇦🇷 Argentina vs Meksiko 🇲🇽      │
│           12 Jun 2026 - 01:00 WIB        │
├─────────────────────────────────────────┤
│                                          │
│   Argentina        :        Meksiko      │
│   ┌────────┐              ┌────────┐     │
│   │   2    │    -         │   1    │     │
│   └────────┘              └────────┘     │
│   [+][-]                   [+][-]          │
│                                          │
│   → Sistem Prediksi: Argentina Menang     │
│                                          │
│        [ 💾 SIMPAN PREDIKSI ]            │
│                                          │
└─────────────────────────────────────────┘
```

#### 🔵 Frontend Request: Submit Prediksi
```
POST /api/v1/world-cup/predict
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "match_id": "match_001",
  "home_score_predicted": 2,
  "away_score_predicted": 1
}
```

#### ✅ Backend Processing (Otomatis):
```php
// Backend auto-calculate winner
if (2 > 1) → predicted_team = "Argentina"
if (2 > 1) → predicted_result_label = "home_win"
```

**Response:**
```json
{
  "status": "success",
  "message": "Prediksi berhasil disimpan",
  "data": {
    "predicted_team": "Argentina",
    "predicted_result_label": "home_win"
  }
}
```

#### 🎨 Frontend Feedback:
```
┌─────────────────────────────────────────┐
│        🇦🇷 Argentina vs Meksiko 🇲🇽      │
│           12 Jun 2026 - 01:00 WIB        │
├─────────────────────────────────────────┤
│                                          │
│   Argentina        :        Meksiko      │
│   ┌────────┐              ┌────────┐     │
│   │   2    │    -         │   1    │     │
│   └────────┘              └────────┘     │
│                                          │
│   ✅ Prediksi Tersimpan!                  │
│   → Kamu memilih: Argentina Menang       │
│                                          │
│   Status: ⏳ Menunggu Hasil              │
│                                          │
│        [ ✏️ UBAH PREDIKSI ]              │
│                                          │
└─────────────────────────────────────────┘
```

---

### STEP 4: User Mengisi Semua Prediksi Matchday 1

#### 🔵 Frontend Request: Ambil Semua Match Group A Matchday 1
```
GET /api/v1/world-cup/matches?phase=group_stage&group=A&matchday=1
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "match_001",
      "home_team": { "name": "Argentina" },
      "away_team": { "name": "Meksiko" },
      "match_date": "2026-06-12T01:00:00Z",
      "status": "upcoming"
    },
    {
      "id": "match_002",
      "home_team": { "name": "Afrika Selatan" },
      "away_team": { "name": "Polandia" },
      "match_date": "2026-06-12T07:00:00Z",
      "status": "upcoming"
    }
  ]
}
```

#### 🎨 Frontend: Checklist Prediksi
```
┌─────────────────────────────────────────────┐
│  📋 PREDIKSI SAYA - Matchday 1              │
├─────────────────────────────────────────────┤
│  ✅ match_001: Argentina vs Meksiko         │
│     Skor diprediksi: 2-1                   │
│     Pilih: Argentina Menang                │
├─────────────────────────────────────────────┤
│  ⏳ match_002: Afrika Selatan vs Polonia    │
│     [INPUT SKOR]  ?  -  ?                  │
│     [PILIH GRUP A] [PREDIKSI SEKARANG]      │
└─────────────────────────────────────────────┘
```

---

### STEP 5: Admin Mem-Publish Skor Pertandingan

#### 🔵 Admin Request: Publish Hasil Argentina vs Meksiko
```
POST /api/v1/world-cup/publish/scores
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "match_id": "match_001",
  "home_score": 2,
  "away_score": 1
}
```

#### ✅ Backend Processing (Otomatis):
```php
// Backend auto-calculate for ALL users who predicted
foreach ($predictions as $prediction) {
    $prediction->home_score_actual = 2;
    $prediction->away_score_actual = 1;

    // User predicted 2-1, Actual 2-1 → EXACT SCORE!
    if ($predicted === $actual) {
        $prediction->points_earned = 10;  // POINTS_SCORE_EXACT
        $prediction->score_exact = true;
    }
    // Save to MongoDB
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Skor berhasil dipublish dan poin dihitung",
  "data": {
    "match": {
      "home_team": { "name": "Argentina" },
      "away_team": { "name": "Meksiko" },
      "home_score": 2,
      "away_score": 1,
      "status": "completed"
    },
    "predictions_calculated": 1500,
    "total_points_distributed": 8500
  }
}
```

---

### STEP 6: User Melihat Hasil Prediksinya

#### 🔵 Frontend Request: Ambil Prediksi Saya
```
GET /api/v1/world-cup/predictions
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "pred_001",
      "match": {
        "home_team": { "name": "Argentina" },
        "away_team": { "name": "Meksiko" },
        "match_date": "2026-06-12"
      },
      "home_score_predicted": 2,
      "away_score_predicted": 1,
      "home_score_actual": 2,
      "away_score_actual": 1,
      "predicted_team": "Argentina",
      "result_correct": true,
      "score_exact": true,
      "points_earned": 10,
      "status": "calculated"
    },
    {
      "id": "pred_002",
      "match": {
        "home_team": { "name": "Afrika Selatan" },
        "away_team": { "name": "Polandia" },
        "match_date": "2026-06-12"
      },
      "home_score_predicted": 1,
      "away_score_predicted": 1,
      "home_score_actual": null,
      "away_score_actual": null,
      "predicted_team": "Seri",
      "result_correct": null,
      "score_exact": null,
      "points_earned": 0,
      "status": "pending"
    }
  ],
  "summary": {
    "total_points": 10,
    "total_predictions": 2,
    "exact_scores": 1,
    "winner_correct": 1,
    "accuracy": 100.0
  }
}
```

#### 🎨 Frontend Render - Hasil:
```
┌─────────────────────────────────────────────────────┐
│  📊 HASIL PREDIKSI SAYA                             │
├─────────────────────────────────────────────────────┤
│  🏆 Poin Total: 10 | Exact: 1 | Winner: 1 | Acc: 100%│
├─────────────────────────────────────────────────────┤
│                                                     │
│  ✅ match_001: Argentina vs Meksiko                 │
│     Diprediksi: 2-1 | Actual: 2-1                  │
│     ├─ ⭐ SKOR TEPAT! +10 POIN                     │
│     └─ 🏆 Argentina Menang (Benar)                  │
│                                                     │
│  ⏳ match_002: Afrika Selatan vs Polonia            │
│     Diprediksi: 1-1 | Actual: ?-?                   │
│     └─ 🕐 Menunggu hasil...                         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

### STEP 7: User Cek Rank & Leaderboard

#### 🔵 Frontend Request: Ambil Rank Saya
```
GET /api/v1/world-cup/me/rank
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "rank": 1,
    "total_points": 10,
    "total_participants": 500
  }
}
```

#### 🔵 Frontend Request: Ambil Leaderboard
```
GET /api/v1/world-cup/leaderboard
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "entries": [
      { "rank": 1, "user": { "name": "Ahlun" }, "total_points": 10, "exact_scores": 1 },
      { "rank": 2, "user": { "name": "Budi" }, "total_points": 10, "exact_scores": 1 },
      { "rank": 3, "user": { "name": "Charlie" }, "total_points": 5, "exact_scores": 0 }
    ],
    "total_participants": 500
  }
}
```

#### 🎨 Frontend Render - Leaderboard:
```
┌─────────────────────────────────────────────────────┐
│  🏆 LEADERBOARD - Group Stage                       │
├─────────────────────────────────────────────────────┤
│  #1  🥇 Ahlun         ████████████  10 pts ⭐1     │
│  #2  🥈 Budi          ████████████  10 pts ⭐1     │
│  #3  🥉 Charlie       █████          5 pts ⭐0    │
│  #4     Diana         ████          5 pts ⭐0     │
│  #5     Erlang        ███           5 pts ⭐0     │
│  ...                                               │
│  #500  Zola           █             0 pts ⭐0     │
├─────────────────────────────────────────────────────┤
│  📍 Posisi Kamu: #1 dari 500 participant          │
│  🏆 Kamu sementara di puncak!                      │
└─────────────────────────────────────────────────────┘
```

---

## 📊 FLOW DIAGRAM LENGKAP

```
┌──────────────────────────────────────────────────────────────────┐
│                         FRONTEND FLOW                            │
└──────────────────────────────────────────────────────────────────┘

  ┌──────────┐
  │  USER    │
  │  LOGIN   │
  └────┬─────┘
       │ GET /teams?grouped=true
       ▼
  ┌────────────────────────────┐
  │  TAMPILKAN GRUP (A-H)      │
  │  + JADWAL PERTANDINGAN    │
  └────────────┬───────────────┘
               │ User pilih match
               ▼
  ┌────────────────────────────┐
  │  FORM INPUT SKOR (2-1)     │
  │  Backend auto-hitung      │
  │  winner = Argentina       │
  └────────────┬───────────────┘
               │ POST /predict
               ▼
  ┌────────────────────────────┐
  │  ✅ "Prediksi Tersimpan"  │
  │  → Argentina Menang       │
  └────────────────────────────┘

  ⏳ MENUNGGU PERTANDINGAN SELESAI

               │ (Admin)
               │ POST /publish/scores
               ▼
  ┌────────────────────────────┐
  │  BACKEND HITUNG POIN      │
  │  Semua user:              │
  │  - Exact score → 10 pts   │
  │  - Winner correct → 5 pts │
  │  - Wrong → 0 pts          │
  └────────────┬───────────────┘
               │
               │ GET /predictions
               ▼
  ┌────────────────────────────┐
  │  TAMPILKAN HASIL PREDIKSI │
  │  🏆 +10 POIN (Skor Tepat) │
  └────────────┬───────────────┘
               │
               │ GET /me/rank
               │ GET /leaderboard
               ▼
  ┌────────────────────────────┐
  │  🏆 LEADERBOARD UPDATE    │
  │  Rank #1 - 10 pts         │
  └────────────────────────────┘
```

---

## 🔗 RINGKASAN API YANG DIGUNAKAN FRONTEND

| Step | Method | Endpoint | Kapan Dipakai |
|------|--------|----------|---------------|
| 1 | GET | `/phases` | Load halaman awal |
| 2 | GET | `/teams?grouped=true` | Tampilkan tim per grup |
| 3 | GET | `/matches?phase&group&matchday` | Tampilkan jadwal |
| 4 | POST | `/predict` | Submit prediksi skor |
| 5 | GET | `/matches-with-prediction` | Cek status prediksi per match |
| 6 | POST | `/publish/scores` | **(Admin)** Publish hasil |
| 7 | GET | `/predictions` | Lihat hasil semua prediksi |
| 8 | GET | `/me/rank` | Cek ranking user |
| 9 | GET | `/me/summary` | Lihat statistik total |
| 10 | GET | `/leaderboard` | Lihat leaderboard |

---

## ⚠️ CATATAN PENTING UNTUK FRONTEND

1. **Match yang sudah selesai** → Tidak bisa submit prediksi (status `is_prediction_open: false`)

2. **Before match** → User bisa ubah prediksi

3. **After match** → Prediksi terkunci, hasil otomatis muncul

4. **Single Form** → User hanya input skor, sistem otomatis tentukan winner:
   - `home > away` → home_win
   - `home < away` → away_win
   - `home == away` → draw

5. **Point Calculation** terjadi saat Admin memanggil `/publish/scores` — frontend hanya perlu fetch ulang `/predictions` untuk melihat hasil terbaru

---

## 📊 Endpoint Summary

| # | Method | Endpoint | Auth | Fungsi |
|---|--------|----------|------|--------|
| 1 | GET | `/phases` | ❌ | List fase |
| 2 | GET | `/teams` | ❌ | List tim |
| 3 | GET | `/teams?grouped=true` | ❌ | Tim per grup |
| 4 | GET | `/matches` | ❌ | List match |
| 5 | GET | `/matches?phase=group_stage` | ❌ | Match fase grup |
| 6 | GET | `/matches/{id}` | ❌ | Detail match |
| 7 | GET | `/leaderboard` | ❌ | Leaderboard |
| 8 | GET | `/predictions` | ✅ | List prediksi user |
| 9 | GET | `/matches-with-prediction` | ✅ | Match + status prediksi |
| 10 | POST | `/predict` | ✅ | Submit prediksi |
| 11 | GET | `/me/rank` | ✅ | Rank user |
| 12 | GET | `/me/summary` | ✅ | Summary user |
| 13 | POST | `/publish/scores` | ✅ | Publish skor |

---

## ⚠️ Error Codes

| Code | Message |
|------|---------|
| 400 | Prediksi sudah ditutup |
| 400 | Pertandingan sudah selesai |
| 404 | Pertandingan tidak ditemukan |
| 422 | Validasi gagal |

---

Generated: 2026-05-21 | World Cup 2026 Prediction API