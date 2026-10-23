# Olahbola Game — Backend API Documentation (Part 1 of 9)

> **Base URL:** `https://<domain>/api/v1`
> **Auth:** Sanctum Bearer token pada endpoint bertanda `[Auth]`.
> **Content-Type:** `application/json`
> **Response envelope umum:** `{ "data": {...} }` atau `{ "message": "..." }` pada error.

---

## Daftar Isi Per Part

| Part | Topik | Status |
|------|-------|--------|
| **1** | Overview + Auth + Profile | ✅ Ini |
| 2 | Reference Data (Players, Clubs, Leagues, Formations) | ✅ Ini |
| 3 | Pack Opening & Inventory | ✅ Ini |
| 4 | Squad Building & Validation | ✅ Ini |
| 5 | Duel System & Matchmaking | ✅ Ini |
| 6 | Energy & Points System | ✅ Ini |
| 7 | Daily Reward System | ✅ Ini |
| 8 | Share to Story | ✅ Ini |
| 9 | Game Flow Alur End-to-End | ✅ Ini |
| **10** | FIFA ASEAN Cup Prediction | ✅ Baru |
| **11** | Super Big Match Prediction | ✅ Baru |

---

## Overview Game Flow

```
REGISTER / LOGIN
     │
     ▼
HOME SCREEN (Daily Reward + Energy + Balance HUD)
     │
     ├──► PACKS: Buka pack → dapat kartu
     │
     ├──► INVENTORY: Lihat semua kartu yang dimiliki
     │
     ├──► SQUAD: Build tim → Validate → Duel Challenge
     │                        │
     │                        ▼
     │                  RESULT SCREEN (points/gems won)
     │
     ├──► SHARE: Share squad ke story → dapat bonus
     │
     └──► POINTS: Tukar points → gems → ulang buka pack
```

---

## 1. Authentication & Session

### 1.1 Register
**`POST /api/v1/auth/register`** — Tanpa auth

```json
// Request body
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123",
  "register_via": "email"
}
```

```json
// Response 200
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": { "id": "...", "name": "...", "email": "..." },
    "token": "1|abc123..."
  }
}
```

### 1.2 Login
**`POST /api/v1/auth/login`** — Tanpa auth

```json
// Request body
{
  "email": "john@example.com",
  "password": "secret123"
}
```

```json
// Response 200
{
  "status": "success",
  "data": {
    "user": { "id": "...", "name": "...", "email": "..." },
    "token": "1|abc123..."
  }
}
```

### 1.3 Get Current User
**`GET /api/v1/auth/user`** `[Auth]`

```json
// Response 200
{
  "status": "success",
  "data": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "city": "Jakarta",
    "email_verified_at": "..."
  }
}
```

### 1.4 Logout
**`POST /api/v1/auth/logout`** `[Auth]`

```json
// Response 200
{ "message": "Logged out successfully" }
```

---

## 2. Profile & HUD Data

Profile menyediakan semua data skor, mata uang, dan energy untuk HUD.

### 2.1 Get Profile
**`GET /api/v1/ngolah-bola/profile`** `[Auth]`

Mengembalikan data lengkap user game profile. Jika belum ada, otomatis dibuat.

```json
// Response 200
{
  "data": {
    "total_gems": 450,
    "pity_counters": {
      "rating_70": 3,
      "rating_85": 1
    },
    "last_opened_at": "2026-09-07T10:00:00.000000Z",
    "inventory_count": 12
  }
}
```

> **Catatan:** `pity_counters.rating_70` = jumlah pack belum dapat rating >= 70. Threshold default: 10.
> `pity_counters.rating_85` = jumlah pack belum dapat rating >= 85. Threshold default: 15.

### 2.2 Energy Status
**`GET /api/v1/ngolah-bola/duel/energy`** `[Auth]`

```json
// Response 200
{
  "data": {
    "energy": 80,
    "energy_max": 100,
    "duels_played": 5,
    "duels_won": 3,
    "duels_lost": 2,
    "win_rate": 60.0
  }
}
```

### 2.3 Points Balance
**`GET /api/v1/ngolah-bola/points/balance`** `[Auth]`

```json
// Response 200
{
  "data": {
    "points_balance": 150,
    "hard_currency_balance": 450,
    "soft_currency_balance": 20,
    "exchange_rate": 100
  }
}
```

> `exchange_rate` = jumlah points yang dibutuhkan untuk menukar 1 gem.

### 2.4 User Game Profile (Full HUD)
**`GET /api/v1/profile`** `[Auth]`

Endpoint ini menggabungkan data user utama + game profile untuk ditampilkan di layar home.

```json
// Response 200
{
  "status": "success",
  "data": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "total_gems": 450,
    "points_balance": 150,
    "hard_currency_balance": 450,
    "soft_currency_balance": 20,
    "energy": 80,
    "energy_max": 100,
    "daily_login_streak": 3,
    "duels_played": 5,
    "duels_won": 3,
    "duels_lost": 2,
    "has_shared_first_time": false,
    "pity_counters": {
      "rating_70": 3,
      "rating_85": 1
    }
  }
}
```

---

## 3. Error Response Format

Semua endpoint mengembalikan error dalam format konsisten:

```json
// 401 Unauthorized
{ "message": "Unauthenticated." }

// 422 Validation Error
{
  "message": "The tactic field is required.",
  "errors": {
    "tactic": ["The tactic field is required."]
  }
}

// 404 Not Found
{ "message": "Skuad tidak ditemukan." }

// 403 Forbidden
{ "message": "Kartu tidak milik Anda." }
```

---

*Part 1 selesai. Lanjut ke Part 2 (Reference Data)?*
# Olahbola Game — Backend API Documentation (Part 2 of 9)

> **Base URL:** `https://<domain>/api/v1`
> **Auth:** Semua endpoint di bawah ini **publik (tanpa auth)**.

---

## Reference Data (Milestone 1 — Foundation)

Data referensi ini digunakan untuk populate pilihan formasi, filter pemain, dan display info klub/liga di UI.

---

### 2.1 Get Players
**`GET /api/v1/ngolah-bola/reference/players`** — Publik

```json
// Query parameters (opsional)
// ?position=GK,CB&league_id=5&club_id=12&min_rating=75&max_rating=90&per_page=15&page=1

{
  "data": [
    {
      "_id": "60d5ec...",
      "full_name": "Lionel Messi",
      "known_as": "MESSI",
      "position_primary": "RW",
      "position_alternatives": ["CAM", "LW"],
      "base_rating": 93,
      "archetype_code": "playmaker",
      "traits": ["dribbler", "free_kick_specialist"],
      "base_attributes": {
        "pace": 85,
        "shooting": 95,
        "passing": 92,
        "dribbling": 96,
        "defending": 38,
        "physical": 65
      },
      "is_active": true,
      "fictional_club_id": "60d5abc...",
      "club": {
        "name": "Inter Miami",
        "short_code": "MIA",
        "country_code": "USA"
      },
      "league": {
        "name": "MLS",
        "country": "USA"
      },
      "cards": [
        {
          "_id": "60d5ef...",
          "overall_rating": 93,
          "rarity": "legend",
          "boosted_attributes": {"shooting": 5, "dribbling": 3},
          "card_frame_style": "gold",
          "is_holographic": true,
          "collector_badge_id": "legend_001"
        }
      ]
    }
  ],
  "meta": {
    "total": 12450,
    "per_page": 15,
    "current_page": 1,
    "last_page": 830
  }
}
```

> `position_alternatives` — array string posisi tambahan yang bisa dimainkan.
> `traits` — array kode trait (mis. `dribbler`, `leader`, `clutch`).
> `base_attributes` — objek 6 atribut dasar (pace/shooting/passing/dribbling/defending/physical), rating 1–99.

---

### 2.2 Get Leagues
**`GET /api/v1/ngolah-bola/reference/leagues`** — Publik

```json
{
  "data": [
    {
      "_id": "60d5abc...",
      "name": "Premier League",
      "country": "Inggris",
      "logo_url": "https://...",
      "is_active": true,
      "clubs_count": 20
    }
  ]
}
```

---

### 2.3 Get Clubs
**`GET /api/v1/ngolah-bola/reference/clubs`** — Publik

```json
// Query parameters (opsional)
// ?league_id=5&per_page=15

{
  "data": [
    {
      "_id": "60d5abc...",
      "name": "Manchester City",
      "short_code": "MCI",
      "country_code": "ENG",
      "is_active": true,
      "league": {
        "_id": "60d5def...",
        "name": "Premier League"
      }
    }
  ],
  "meta": {
    "total": 500,
    "per_page": 15,
    "current_page": 1,
    "last_page": 34
  }
}
```

---

### 2.4 Get Formations
**`GET /api/v1/ngolah-bola/reference/formations`** — Publik

```json
{
  "data": {
    "4-3-3": ["GK", "LB", "CB", "CB", "RB", "CM", "CM", "CM", "LW", "ST", "RW"],
    "4-4-2": ["GK", "LB", "CB", "CB", "RB", "LM", "CM", "CM", "RM", "ST", "ST"],
    "3-5-2": ["GK", "CB", "CB", "CB", "LM", "CM", "CM", "CM", "RM", "ST", "ST"],
    "4-2-3-1": ["GK", "LB", "CB", "CB", "RB", "CDM", "CDM", "LM", "CAM", "RM", "ST"],
    "4-3-2-1": ["GK", "LB", "CB", "CB", "RB", "CM", "CM", "CM", "LW", "RW", "ST"],
    "3-4-3": ["GK", "CB", "CB", "CB", "LM", "CM", "CM", "RM", "LW", "ST", "RW"],
    "5-3-2": ["GK", "LWB", "CB", "CB", "CB", "RWB", "CM", "CM", "CM", "ST", "ST"],
    "4-1-4-1": ["GK", "LB", "CB", "CB", "RB", "CDM", "LM", "CM", "CM", "RM", "ST"],
    "3-6-1": ["GK", "CB", "CB", "CB", "LM", "CM", "CM", "CM", "RM", "CAM", "ST"],
    "4-2-4": ["GK", "LB", "CB", "CB", "RB", "CDM", "CDM", "LW", "ST", "ST", "RW"],
    "4-5-1": ["GK", "LB", "CB", "CB", "RB", "LM", "CM", "CM", "CM", "RM", "ST"],
    "3-4-2-1": ["GK", "CB", "CB", "CB", "LM", "CM", "CM", "RM", "LW", "RW", "ST"]
  },
  "meta": {
    "description": "Key = formation_code, Value = array of slot_code in order"
  }
}
```

> **Slot codes yang dipakai:**
> - `GK` — Goalkeeper
> - `LB`, `CB`, `RB` — Back line
> - `LWB`, `RWB` — Wing back
> - `CDM`, `CM`, `CAM` — Midfield
> - `LM`, `RM` — Wide mid
> - `LW`, `RW` — Wide attack
> - `ST` — Striker

---

*Part 2 selesai. Lanjut ke Part 3 (Pack Opening & Inventory)?*
# Olahbola Game — Backend API Documentation (Part 3 of 9)

> **Base URL:** `https://<domain>/api/v1`
> **Auth:** Semua endpoint di bawah ini `[Auth]`.

---

## 3. Pack Opening & Inventory (Milestone 2)

### 3.1 Get Pack Catalog
**`GET /api/v1/ngolah-bola/pack/catalog`** — Publik

Mengembalikan daftar pack yang tersedia dan aktif.

```json
{
  "data": [
    {
      "_id": "60d5abc...",
      "pack_name": "Premium Pack",
      "cost_in_gems": 100,
      "cards_per_pack": 5,
      "available_rarities": ["bronze", "silver", "gold", "legend"],
      "pity_rating_70_threshold": 10,
      "pity_rating_85_threshold": 15,
      "is_active": true,
      "drop_rates": {
        "bronze": 0.45,
        "silver": 0.35,
        "gold": 0.15,
        "legend": 0.05
      }
    }
  ]
}
```

> **Pity System:**
> - `pity_rating_70_threshold`: jumlah pack dibuka tanpa card rating >= 70 → dijamin dapat card >= 70.
> - `pity_rating_85_threshold`: jumlah pack dibuka tanpa card rating >= 85 → dijamin dapat card >= 85.
> - Rating >= 85 memenuhi kedua threshold (pity 70 & 85 reset).
> - Rating >= 70 tapi < 85: reset pity 70, tambah pity 85.
> - Rating < 70: tambah kedua pity counter.

---

### 3.2 Open Pack
**`POST /api/v1/ngolah-bola/pack/open/{packId}`** `[Auth]`

Membuka pack dan mendapatkan kartu acak sesuai drop rate + pity system.

```json
// Request path parameter
packId: string (MongoDB _id dari pack catalog)

// Response 200
{
  "data": {
    "pack_name": "Premium Pack",
    "results": [
      {
        "card_id": "60d5ef...",
        "player_name": "Lionel Messi",
        "rarity": "legend",
        "overall_rating": 93,
        "boosted_attributes": { "shooting": 5, "dribbling": 3 },
        "guaranteed": false
      }
    ],
    "gems_remaining": 400,
    "pity_counters": {
      "rating_70": 3,
      "rating_85": 1
    },
    "pity_applied": false,
    "next_guarantee_at": {
      "rating_70": 7,
      "rating_85": 14
    }
  }
}

// Response 422 — Gems tidak cukup
{ "message": "Gems tidak cukup. Butuh 100, tersedia 50" }

// Response 404 — Pack tidak ditemukan
{ "message": "Pack tidak ditemukan." }
```

> `guaranteed: true` menandakan kartu ini didapat dari pity (bukan random draw).
> `next_guarantee_at` = berapa pack lagi sampai pity berikutnya terpenuhi.

---

### 3.3 Get Inventory
**`GET /api/v1/ngolah-bola/inventory`** `[Auth]`

```json
// Query parameters (opsional)
// ?rarity=legend&per_page=20&page=1

{
  "data": [
    {
      "id": "60d5xyz...",
      "card_id": "60d5abc...",
      "player_name": "Cristiano Ronaldo",
      "rarity": "legend",
      "overall_rating": 91,
      "boosted_attributes": { "pace": 3, "shooting": 4 },
      "position_primary": "ST",
      "obtained_at": "2026-09-06T14:30:00.000000Z",
      "source_pack_id": "60d5pack..."
    }
  ],
  "meta": {
    "total": 12,
    "per_page": 20,
    "current_page": 1,
    "last_page": 1
  }
}
```

> `rarity` enum: `bronze`, `silver`, `gold`, `legend`.

---

*Part 3 selesai. Lanjut ke Part 4 (Squad Building & Validation)?*
# Olahbola Game — Backend API Documentation (Part 4 of 9)

> **Base URL:** `https://<domain>/api/v1`
> **Auth:** Semua endpoint di bawah ini `[Auth]`.

---

## 4. Squad Building & Validation (Milestone 3–4)

Skuad = tim yang dibangun dari kartu di inventory. Maks **5 skuad** per user.
Setiap skuad memiliki formasi (11 slot) dan budget cap.

---

### 4.1 List Squads
**`GET /api/v1/ngolah-bola/squads`** `[Auth]`

```json
{
  "data": [
    {
      "id": "60d5abc...",
      "name": "Skuad Utama",
      "formation": "4-3-3",
      "budget_cap": 1000,
      "created_at": "2026-09-01T08:00:00.000000Z"
    }
  ]
}
```

---

### 4.2 Create Squad
**`POST /api/v1/ngolah-bola/squads`** `[Auth]`

```json
// Request body (semua opsional)
{
  "name": "Skuad Utama",
  "formation": "4-3-3",
  "budget_cap": 1000
}

// Response 201
{
  "data": {
    "id": "60d5abc...",
    "name": "Skuad Utama",
    "formation": "4-3-3",
    "budget_cap": 1000
  }
}

// Response 422 — Maksimal 5 skuad
{ "message": "Maksimal 5 skuad per pengguna." }
```

> Default formation: `4-3-3`, default budget_cap: `1000`.

---

### 4.3 Get Squad Detail
**`GET /api/v1/ngolah-bola/squads/{squadId}`** `[Auth]`

```json
{
  "data": {
    "id": "60d5abc...",
    "name": "Skuad Utama",
    "formation": "4-3-3",
    "budget_cap": 1000,
    "budget_used": 870,
    "budget_remaining": 130,
    "chemistry": 68,
    "slots": ["GK", "LB", "CB", "CB", "RB", "CM", "CM", "CM", "LW", "ST", "RW"],
    "filled_slots": 9,
    "players": [
      {
        "slot": "GK",
        "position_slot": "GK",
        "card_id": "60d5ef...",
        "player_name": "Ederson",
        "position_primary": "GK",
        "overall_rating": 88,
        "rarity": "gold",
        "traits": ["shot_stopper"],
        "archetype": null
      },
      {
        "slot": "ST",
        "position_slot": "ST",
        "card_id": "60d5xyz...",
        "player_name": "Erling Haaland",
        "position_primary": "ST",
        "overall_rating": 91,
        "rarity": "legend",
        "traits": ["finisher", "aerial"],
        "archetype": "striker"
      }
    ]
  }
}
```

> `slots` = array posisi sesuai formasi. `null` berarti slot belum terisi.
> `chemistry` = skor kimia tim (0–100), dihitung dari rating rata-rata + balance + synergy traits + nationality.
> `budget_used` = total overall_rating semua kartu di skuad.

---

### 4.4 Update Squad
**`PUT /api/v1/ngolah-bola/squads/{squadId}`** `[Auth]`

```json
// Request body (opsional)
{
  "name": "Skuad Baru",
  "formation": "4-4-2",
  "budget_cap": 1200
}

// Response 200
{ "data": { "id": "60d5abc...", "name": "Skuad Baru" } }
```

---

### 4.5 Delete Squad
**`DELETE /api/v1/ngolah-bola/squads/{squadId}`** `[Auth]`

```json
{ "message": "Skuad dihapus." }
```

---

### 4.6 Add Player to Squad
**`POST /api/v1/ngolah-bola/squads/{squadId}/players`** `[Auth]`

Menempatkan kartu ke slot tertentu. Validasi otomatis: slot kosong, posisi cocok, budget cukup, kartu milik user.

```json
// Request body
{
  "card_id": "60d5ef...",
  "slot": "ST"
}

// Response 201
{
  "data": {
    "id": "60d5sp...",
    "slot": "ST",
    "card_id": "60d5ef..."
  }
}

// Response 422 — Slot sudah terisi
{ "message": "Slot ST sudah terisi." }

// Response 422 — Posisi tidak cocok
{ "message": "Kartu tidak bisa dimainkan di posisi ST." }

// Response 422 — Budget melebihi cap
{ "message": "Budget melebihi cap skuad." }

// Response 403 — Kartu tidak milik user
{ "message": "Kartu tidak milik Anda." }
```

> `slot` enum: `GK`, `LB`, `CB`, `RB`, `CDM`, `CM`, `LM`, `RM`, `CAM`, `LW`, `RW`, `ST`.

---

### 4.7 Remove Player from Squad
**`DELETE /api/v1/ngolah-bola/squads/{squadId}/players/{slot}`** `[Auth]`

```json
// Response 200
{ "message": "Pemain dilepas." }

// Response 404 — Slot kosong atau skuad tidak ditemukan
{ "message": "Slot kosong." }
```

---

### 4.8 Get Squad Chemistry
**`GET /api/v1/ngolah-bola/squads/{squadId}/chemistry`** `[Auth]`

Menghitung semua synergy pair berdasarkan trait yang dimiliki pemain.

```json
// Response dengan 2+ pemain memiliki trait yang cocok
{
  "data": {
    "total": 8,
    "synergies": [
      { "card_a": "60d5ef1...", "card_b": "60d5ef2...", "points": 4 },
      { "card_a": "60d5ef1...", "card_b": "60d5ef3...", "points": 4 }
    ],
    "breakdown": [
      {
        "card_id": "60d5ef1...",
        "traits": ["finisher", "aerial"],
        "position": "ST",
        "rating": 91
      }
    ]
  }
}

// Response dengan < 2 pemain
{ "data": { "total": 0, "synergies": [], "breakdown": [] } }
```

> `synergies` = pasangan pemain yang berbagi trait bersama. `points` = synergy_points dari database.
> Chemistry score squad (di endpoint show) menggabungkan: rating avg × 0.5 + balance bonus + synergy bonus + nationality bonus (maks 100).

---

### 4.9 Validate Squad for Duel
**`POST /api/v1/ngolah-bola/squads/{squadId}/validate-duel`** `[Auth]`

Validasi pra-duel: cek jumlah pemain minimal, posisi wajib terisi.

```json
// Response 200 — Siap duel
{
  "data": {
    "ready": true,
    "errors": [],
    "player_count": 11
  }
}

// Response 200 — Belum siap
{
  "data": {
    "ready": false,
    "errors": {
      "min_players": "Skuad harus memiliki minimal 11 pemain. Saat ini: 9",
      "position_CM": "Posisi CM kosong"
    },
    "player_count": 9
  }
}
```

> Validasi diperlukan sebelum memanggil `POST /duel/challenge`.

---

*Part 4 selesai. Lanjut ke Part 5 (Duel System & Matchmaking)?*
# Olahbola Game — Backend API Documentation (Part 5 of 9)

> **Base URL:** `https://<domain>/api/v1`
> **Auth:** Semua endpoint di bawah ini `[Auth]`.

---

## 5. Duel System & Matchmaking (Milestone 5–6)

### Konstanta Game Engine

| Konstanta | Nilai | Keterangan |
|-----------|-------|------------|
| Energy cost per duel | 10 | Energi terpakai tiap duel |
| Energy refund on win | 5 | Energi kembali jika menang |
| Max energy | 100 | Energi maksimum |
| Gems won on win | 5 | Gems didapat jika menang |
| Points earned (win) | 15 | Points duel menang |
| Points earned (draw) | 5 | Points duel seri |
| Points earned (lose) | 2 | Points duel kalah |
| Tactic bonus | ±10% | Advantage taktik rock-paper-scissors |
| Random factor | ±15% | Variance hasil battle |

### Siklus Taktik (Rock-Paper-Scissors)

```
attacking  beats  defensive
defensive  beats  counter
counter    beats  attacking
```

---

### 5.1 Find Match
**`POST /api/v1/ngolah-bola/duel/match/find`** `[Auth]`

Mencari opponent real-time. Jika tidak ada, UI harus menampilkan fallback bot via `/duel/challenge`.

```json
// Response 200 — Opponent ditemukan
{
  "data": {
    "opponent": {
      "opponent_user_id": "abc123...",
      "opponent_squad_id": "def456...",
      "opponent_name": "Player Two",
      "opponent_formation": "4-4-2"
    },
    "my_energy": 80,
    "energy_cost": 10
  }
}

// Response 404 — Tidak ada opponent
{ "message": "Tidak ada opponent yang cocok saat ini. Coba lagi nanti." }

// Response 422 — Energi tidak cukup
{ "message": "Energi tidak cukup. Butuh 10 energy." }
```

---

### 5.2 Request Match (Direct Challenge)
**`POST /api/v1/ngolah-bola/duel/match/request`** `[Auth]`

Mengirim undangan duel ke user tertentu.

```json
// Request body
{
  "target_user_id": "abc123..."
}

// Response 201
{
  "data": {
    "success": true,
    "match_id": "xyz789..."
  }
}
```

---

### 5.3 Respond to Match
**`POST /api/v1/ngolah-bola/duel/match/{matchId}/respond`** `[Auth]`

Menerima atau menolak undangan duel.

```json
// Request body
{
  "accept": true
}

// Response 200
{
  "data": {
    "success": true,
    "matched": true
  }
}
```

---

### 5.4 Get Pending Matches
**`GET /api/v1/ngolah-bola/duel/matches`** `[Auth]`

```json
{
  "data": [
    {
      "id": "xyz789...",
      "requester_id": "abc123...",
      "requester_name": "Player Two",
      "created_at": "2026-09-07T10:00:00.000000Z"
    }
  ]
}
```

---

### 5.5 Battle (Two-Step Flow)
**`POST /api/v1/ngolah-bola/duel/battle`** `[Auth]`

Eksekusi battle setelah matchmaking selesai. Alur dua langkah:
1. `POST /duel/match/find` → dapatkan opponent
2. `POST /duel/battle` → eksekusi battle dengan squad + tactic

```json
// Request body
{
  "squad_id": "60d5squad...",
  "tactic": "attacking"
}

// Response 200 — Menang
{
  "data": {
    "duel_id": "60d5duel...",
    "result": "win",
    "my_score": 78.5,
    "opponent_score": 62.3,
    "tactical_advantage": "attacking_beats_defensive",
    "score_breakdown": {
      "attack": { "my": 45.2, "opponent": 30.1 },
      "midfield": { "my": 20.0, "opponent": 18.5 },
      "defense": { "my": 13.3, "opponent": 13.7 }
    },
    "energy": {
      "spent": 10,
      "refunded": 5,
      "remaining": 75,
      "max": 100
    },
    "reward": {
      "gems_won": 5,
      "total_gems": 455
    },
    "duel_record": {
      "played": 6,
      "won": 4,
      "lost": 2
    }
  }
}

// Response 200 — Kalah
{
  "data": {
    "result": "lose",
    "my_score": 45.0,
    "opponent_score": 70.2,
    ...
  }
}

// Response 422 — Belum ada match
{ "message": "Temukan opponent terlebih dahulu dengan endpoint /duel/match/find" }
```

> `tactical_advantage` enum:
> - `attacking_beats_defensive`
> - `defensive_beats_counter`
> - `counter_beats_attacking`
> - `none` (tactic sama atau draw)

---

### 5.6 Challenge (Full Flow — Recommended)
**`POST /api/v1/ngolah-bola/duel/challenge`** `[Auth]`

Satu endpoint untuk flow lengkap: validasi → matchmaking → battle → rewards.
Fallback otomatis ke bot jika tidak ada opponent real.

```json
// Request body
{
  "squad_id": "60d5squad...",
  "tactic": "attacking",
  "idempotency_key": "duel_20260907_001"
}

// Response 200 — Menang vs bot
{
  "data": {
    "duel_id": "60d5duel...",
    "result": "win",
    "my_score": 82.0,
    "opponent_score": 65.0,
    "tactical_advantage": "attacking_beats_defensive",
    "score_breakdown": {
      "attack":  { "my": 48.0, "opponent": 32.0 },
      "midfield": { "my": 22.0, "opponent": 18.0 },
      "defense":  { "my": 12.0, "opponent": 15.0 }
    },
    "energy": {
      "spent": 10,
      "refunded": 5,
      "remaining": 75,
      "max": 100
    },
    "reward": {
      "gems_won": 5,
      "points_earned": 15,
      "total_gems": 455
    },
    "duel_record": {
      "played": 6,
      "won": 4,
      "lost": 2
    },
    "is_bot_match": true
  }
}

// Response 422 — Sudah submit key yang sama
{ "message": "Challenge already submitted with this key." }

// Response 422 — Skuad tidak valid
{
  "message": "Skuad tidak valid untuk duel.",
  "errors": {
    "min_players": "Skuad harus memiliki minimal 11 pemain. Saat ini: 9"
  }
}
```

> **Idempotency:** `idempotency_key` harus unik per challenge. Gunakan format `duel_<squad_id>_<timestamp>` atau UUID client-side. Duplicate key akan ditolak 422.

---

### 5.7 Get Duel History
**`GET /api/v1/ngolah-bola/duel/history`** `[Auth]`

```json
{
  "data": [
    {
      "id": "60d5duel1...",
      "opponent_id": "bot",
      "formation": "4-3-3",
      "my_tactic": "attacking",
      "opponent_tactic": "defensive",
      "result": "win",
      "score_breakdown": {
        "attack":  { "my": 48.0, "opponent": 32.0 },
        "midfield": { "my": 22.0, "opponent": 18.0 },
        "defense":  { "my": 12.0, "opponent": 15.0 }
      },
      "gems_won": 5,
      "points_earned": 15,
      "created_at": "2026-09-07T14:00:00.000000Z",
      "ended_at": "2026-09-07T14:00:32.000000Z"
    }
  ]
}
```

>历史记录 paling baru 20 duel terakhir. `opponent_id` = `"bot"` untuk bot match.

---

### 5.8 Refill Energy
**`POST /api/v1/ngolah-bola/duel/energy/refill`** `[Auth]`

Isi ulang energi menggunakan gems. Default: 50 energi untuk 50 gems.

```json
// Request body (semua opsional)
{
  "amount": 50
}

// Response 200
{
  "data": {
    "energy_added": 50,
    "energy_before": 30,
    "energy_after": 80,
    "gems_spent": 50,
    "gems_remaining": 400
  }
}

// Response 422 — Gems tidak cukup
{ "message": "Gems tidak cukup. Butuh 50 gems." }
```

> `amount` range: 10–100. Rate: 1 gem = 1 energy. Max energy cap: 100.

---

*Part 5 selesai. Lanjut ke Part 6 (Energy & Points System)?*
# Olahbola Game — Backend API Documentation (Part 6 of 9)

> **Base URL:** `https://<domain>/api/v1`
> **Auth:** Semua endpoint di bawah ini `[Auth]`.

---

## 6. Energy & Points System (Milestone 5–6)

### 6.1 Energy Constants

| Konstanta | Nilai | Keterangan |
|-----------|-------|------------|
| Energy cost per duel | 10 | Energi terpakai tiap duel |
| Energy refund on win | 5 | Energi kembali jika menang |
| Max energy | 100 | Energi maksimum |
| Energy refill cost | 50 gems → 50 energy | Rate 1 gem = 1 energy |

---

### 6.2 Get Energy Status
**`GET /api/v1/ngolah-bola/duel/energy`** `[Auth]`

```json
{
  "data": {
    "energy": 80,
    "energy_max": 100,
    "duels_played": 5,
    "duels_won": 3,
    "duels_lost": 2,
    "win_rate": 60.0
  }
}
```

---

### 6.3 Refill Energy
**`POST /api/v1/ngolah-bola/duel/energy/refill`** `[Auth]`

```json
// Request body (semua opsional)
{
  "amount": 50
}

// Response 200
{
  "data": {
    "energy_added": 50,
    "energy_before": 30,
    "energy_after": 80,
    "gems_spent": 50,
    "gems_remaining": 400
  }
}

// Response 422 — Gems tidak cukup
{ "message": "Gems tidak cukup. Butuh 50 gems." }
```

> `amount` range: 10–100. Default: 50. Max energy: 100.

---

## 7. Points System (Milestone 2B)

Points diperoleh dari game lain (prediksi skor, kuis trivia, guess who, duel).
Points bisa ditukar ke gems.

### Exchange Rate
- **100 points = 1 gem** (default, configurable via `config('game.points_exchange_rate')`)

---

### 7.1 Get Points Balance
**`GET /api/v1/ngolah-bola/points/balance`** `[Auth]`

```json
{
  "data": {
    "points_balance": 150,
    "hard_currency_balance": 450,
    "total_gems": 450,
    "exchange_rate": 100
  }
}
```

---

### 7.2 Exchange Points to Gems
**`POST /api/v1/ngolah-bola/points/exchange`** `[Auth]`

```json
// Request body
{
  "points_amount": 100,
  "idempotency_key": "exchange_20260907_001"
}

// Response 200
{
  "data": {
    "success": true,
    "points_spent": 100,
    "gems_received": 1,
    "new_points_balance": 50,
    "new_gems_balance": 451
  }
}

// Response 422 — Points tidak cukup
{ "message": "Points tidak cukup." }

// Response 422 — Duplicate key
{ "message": "Points already awarded for this event." }
```

> `idempotency_key` harus unik per transaksi. Format yang direkomendasikan: `exchange_<squad_id>_<timestamp>`.

---

### 7.3 Points Sources (Source Game)

Points dapat masuk dari berbagai sumber game:

| Source Code | Game | Poin per Menang |
|-------------|------|-----------------|
| `prediksi_skor` | Prediksi Skor | 10–20 (tiered) |
| `kuis_trivia` | Kuis Trivia | 5–15 (tiered) |
| `guess_who` | Guess Who | 10 |
| `guess_who` | Duel | 15 (win) / 5 (draw) / 2 (lose) |

> Endpoint ini menggunakan `PointsService::award()` secara internal.
> Idempotency dilindungi di level PointsLedger per `idempotency_key`.

---

*Part 6 selesai. Lanjut ke Part 7 (Daily Reward System)?*
# Olahbola Game — Backend API Documentation (Part 7 of 9)

> **Base URL:** `https://<domain>/api/v1`
> **Auth:** Semua endpoint di bawah ini `[Auth]`.

---

## 7. Daily Reward System (Milestone 7)

Sistem reward harian berjenjang berbasis streak login.

### Reward Tier (7-day cycle)

| Hari | Soft Currency | Hard Currency | Points | Pack Type |
|------|---------------|---------------|--------|-----------|
| 1 | 50 | 0 | 0 | — |
| 2 | 75 | 0 | 0 | — |
| 3 | 100 | 0 | 5 | — |
| 4 | 150 | 0 | 0 | — |
| 5 | 200 | 0 | 0 | — |
| 6 | 250 | 0 | 10 | — |
| 7 | 300 | 0 | 0 | Bronze Pack |

**Weekly multiplier:** Setelah streak > 7, setiap cycle menambah 0.1× multiplier, maks 3.0×.

---

### 7.1 Get Daily Reward Status
**`GET /api/v1/ngolah-bola/daily-reward/status`** `[Auth]`

```json
// Response 200 — Belum claim hari ini, streak 3
{
  "data": {
    "daily_login_streak": 3,
    "has_claimed_today": false,
    "next_reward_day": 3,
    "next_reward": {
      "soft_currency": 100,
      "hard_currency": 0,
      "points": 5,
      "pack_type": null
    }
  }
}

// Response 200 — Sudah claim hari ini
{
  "data": {
    "daily_login_streak": 3,
    "has_claimed_today": true,
    "next_reward_day": 4,
    "next_reward": {
      "soft_currency": 150,
      "hard_currency": 0,
      "points": 0,
      "pack_type": null
    }
  }
}
```

> `next_reward_day` = hari ke-berapa dalam cycle 7 hari.
> Streak reset jika user skip 1 hari atau lebih.

---

### 7.2 Claim Daily Reward
**`POST /api/v1/ngolah-bola/daily-reward/claim`** `[Auth]`

```json
// Request body
{
  "idempotency_key": "daily_20260907_001"
}

// Response 200 — Berhasil claim hari ke-3
{
  "data": {
    "streak_day": 3,
    "streak": 3,
    "reward": {
      "soft_currency": 100,
      "hard_currency": 0,
      "points": 5,
      "pack_type": null
    },
    "soft_currency_balance": 320,
    "hard_currency_balance": 0,
    "points_balance": 155
  }
}

// Response 400 — Sudah claim hari ini
{ "message": "Already claimed today." }

// Response 400 — Idempotency key duplikat
{ "message": "Idempotency key already used." }
```

> `idempotency_key` harus unik per claim. Format: `daily_<tanggal>_<sequential>`.

---

*Part 7 selesai. Lanjut ke Part 8 (Share to Story)?*
# Olahbola Game — Backend API Documentation (Part 8 of 9)

> **Base URL:** `https://<domain>/api/v1`
> **Auth:** Semua endpoint di bawah ini `[Auth]`.

---

## 8. Share to Story (Milestone 8)

User bisa share squad ke media sosial dan mendapat bonus currency.

### Bonus Rules

| Tipe Bonus | Syarat | Reward |
|------------|--------|--------|
| Daily share bonus | 1× per hari per squad | +20 soft currency |
| First share bonus | Sekali seumur hidup per user | +50 hard currency (gems) |

> Kedua bonus bisa didapat bersamaan jika user belum pernah share sebelumnya.

---

### 8.1 Get Share Data
**`GET /api/v1/ngolah-bola/squads/{squadId}/share-data`** `[Auth]`

Mengembalikan data visual squad untuk dirender di share story template.

```json
{
  "data": {
    "formation_code": "4-3-3",
    "squad_name": "Skuad Utama",
    "positions": [
      {
        "slot": "GK",
        "card_id": "60d5ef...",
        "player_name": "Ederson",
        "known_as": "EDERSON",
        "overall_rating": 88,
        "rarity": "gold",
        "card_frame_style": "gold",
        "is_holographic": false,
        "collector_badge_id": null
      },
      {
        "slot": "ST",
        "card_id": "60d5xyz...",
        "player_name": "Erling Haaland",
        "known_as": "HAALAND",
        "overall_rating": 91,
        "rarity": "legend",
        "card_frame_style": "legend",
        "is_holographic": true,
        "collector_badge_id": "legend_002"
      }
    ]
  }
}
```

> `positions` = 11 slot sesuai formasi. Slot kosong = null values.
> `card_frame_style`: `bronze`, `silver`, `gold`, `legend`.
> `is_holographic`: true untuk kartu holografik (bonus visual).

---

### 8.2 Share Log & Claim Bonus
**`POST /api/v1/ngolah-bola/squads/{squadId}/share-log`** `[Auth]`

Mencatat share dan memberikan bonus.

```json
// Request body
{
  "share_asset_url": "https://cdn.example.com/share-story-001.png",
  "shared_to": "instagram"
}

// Response 200 — First share + daily bonus
{
  "data": {
    "bonus_awarded": true,
    "bonus_soft_currency": 20,
    "bonus_awarded_first_share": true,
    "first_share_hard_currency": 50,
    "soft_currency_balance": 340,
    "hard_currency_balance": 50
  }
}

// Response 200 — Sudah share hari ini (tanpa bonus)
{
  "data": {
    "bonus_awarded": false
  }
}

// Response 200 — First share sudah pernah claim (hanya daily bonus)
{
  "data": {
    "bonus_awarded": true,
    "bonus_soft_currency": 20,
    "bonus_awarded_first_share": false,
    "first_share_hard_currency": 0,
    "soft_currency_balance": 360,
    "hard_currency_balance": 50
  }
}

// Response 404 — Squad tidak ditemukan
{ "message": "Squad not found." }
```

> `share_asset_url` = URL gambar story yang di-generate frontend (canvas/upload).
> `shared_to` enum: `instagram`, `twitter`, `whatsapp`, `facebook`, `tiktok`.

---

*Part 8 selesai. Lanjut ke Part 9 (Game Flow Alur End-to-End)?*
# Olahbola Game — Backend API Documentation (Part 9 of 9)

> **Base URL:** `https://<domain>/api/v1`
> **Auth:** Semua endpoint di bawah ini `[Auth]` kecuali yang dicatat.

---

## 9. Game Flow Alur End-to-End

Bagian ini menjelaskan alur lengkap dari login hingga循环 reward, sesuai dengan diagram di [GAME_MILESTONES.md](GAME_MILESTONES.md).

---

### 9.1 Flow: Login → Home Screen

```
1. POST /api/v1/auth/login        → simpan token di HTTP-only cookie / localStorage
2. GET  /api/v1/auth/user         → ambil user info
3. GET  /api/v1/ngolah-bola/profile       → total_gems, pity_counters
4. GET  /api/v1/ngolah-bola/duel/energy   → energy bar
5. GET  /api/v1/ngolah-bola/points/balance → points, hard/soft currency
6. GET  /api/v1/ngolah-bola/daily-reward/status → cek claim status
```

**HUD yang ditampilkan:**

```json
// gabungan dari semua endpoint di atas
{
  "total_gems": 450,
  "points_balance": 150,
  "hard_currency_balance": 450,
  "soft_currency_balance": 20,
  "energy": 80,
  "energy_max": 100,
  "daily_login_streak": 3,
  "has_claimed_today": false,
  "duels_played": 5,
  "duels_won": 3,
  "duels_lost": 2
}
```

---

### 9.2 Flow: Buka Pack

```
1. GET  /api/v1/ngolah-bola/pack/catalog          → daftar pack tersedia
2. POST /api/v1/ngolah-bola/pack/open/{packId}    → buka pack, dapat kartu
3. GET  /api/v1/ngolah-bola/inventory             → lihat semua kartu
4. GET  /api/v1/ngolah-bola/profile               → refresh gems & pity counters
```

**Contoh response pack open:**

```json
{
  "data": {
    "pack_name": "Premium Pack",
    "results": [
      { "card_id": "...", "player_name": "Messi", "rarity": "legend", "overall_rating": 93, "guaranteed": false }
    ],
    "gems_remaining": 400,
    "pity_counters": { "rating_70": 3, "rating_85": 1 },
    "next_guarantee_at": { "rating_70": 7, "rating_85": 14 }
  }
}
```

---

### 9.3 Flow: Build Squad

```
1. POST /api/v1/ngolah-bola/squads                → buat skuad baru
2. GET  /api/v1/ngolah-bola/squads                → list semua skuad
3. GET  /api/v1/ngolah-bola/squads/{squadId}      → detail skuad + slot kosong
4. POST /api/v1/ngolah-bola/squads/{squadId}/players  → tambahkan kartu ke slot
5. DELETE /api/v1/ngolah-bola/squads/{squadId}/players/{slot} → lepas kartu
6. GET  /api/v1/ngolah-bola/squads/{squadId}/chemistry  → hitung synergy
7. POST /api/v1/ngolah-bola/squads/{squadId}/validate-duel → validasi siap duel
```

**Validasi sebelum duel (harus ready = true):**

```json
{
  "data": {
    "ready": true,
    "errors": [],
    "player_count": 11
  }
}
```

---

### 9.4 Flow: Duel (Two Options)

#### Opsi A: Full Flow (Recommended)
```
1. GET  /api/v1/ngolah-bola/duel/energy           → cek energy
2. POST /api/v1/ngolah-bola/duel/challenge        → satu endpoint: validate + find match + battle + rewards
3. GET  /api/v1/ngolah-bola/duel/history          → lihat riwayat
```

#### Opsi B: Step-by-Step
```
1. POST /api/v1/ngolah-bola/duel/match/find       → cari opponent real
2. POST /api/v1/ngolah-bola/duel/battle           → eksekusi battle
   (atau: POST /duel/match/request → POST /duel/match/{id}/respond → POST /duel/battle)
3. GET  /api/v1/ngolah-bola/duel/history          → riwayat
```

**Battle result:**

```json
{
  "data": {
    "result": "win",
    "my_score": 78.5,
    "opponent_score": 62.3,
    "tactical_advantage": "attacking_beats_defensive",
    "score_breakdown": {
      "attack": { "my": 45.2, "opponent": 30.1 },
      "midfield": { "my": 20.0, "opponent": 18.5 },
      "defense": { "my": 13.3, "opponent": 13.7 }
    },
    "energy": { "spent": 10, "refunded": 5, "remaining": 75 },
    "reward": { "gems_won": 5, "points_earned": 15 },
    "duel_record": { "played": 6, "won": 4, "lost": 2 }
  }
}
```

---

### 9.5 Flow: Daily Reward

```
1. GET  /api/v1/ngolah-bola/daily-reward/status   → cek streak & claim status
2. POST /api/v1/ngolah-bola/daily-reward/claim    → klaim reward
3. GET  /api/v1/ngolah-bola/points/balance        → refresh balance setelah claim
```

**Claim response:**

```json
{
  "data": {
    "streak_day": 3,
    "streak": 3,
    "reward": { "soft_currency": 100, "points": 5 },
    "soft_currency_balance": 320,
    "points_balance": 155
  }
}
```

---

### 9.6 Flow: Share to Story

```
1. GET  /api/v1/ngolah-bola/squads/{squadId}/share-data  → ambil data visual squad
2. (Frontend) Generate share image dari canvas/HTML
3. POST /api/v1/ngolah-bola/squads/{squadId}/share-log   → kirim log + claim bonus
4. GET  /api/v1/ngolah-bola/points/balance               → refresh balance
```

**Share log response (first share):**

```json
{
  "data": {
    "bonus_awarded": true,
    "bonus_soft_currency": 20,
    "bonus_awarded_first_share": true,
    "first_share_hard_currency": 50,
    "soft_currency_balance": 340,
    "hard_currency_balance": 50
  }
}
```

---

### 9.7 Flow: Points Exchange

```
1. GET  /api/v1/ngolah-bola/points/balance    → cek saldo points
2. POST /api/v1/ngolah-bola/points/exchange   → tukar points → gems
3. GET  /api/v1/ngolah-bola/profile           → refresh total_gems
```

**Exchange response:**

```json
{
  "data": {
    "success": true,
    "points_spent": 100,
    "gems_received": 1,
    "new_points_balance": 50,
    "new_gems_balance": 451
  }
}
```

---

### 9.8 Full Circular Flow (End-to-End)

```
LOGIN
  │
  ▼
DAILY REWARD (claim streak bonus)
  │
  ▼
OPEN PACK (gems → cards)
  │
  ▼
BUILD SQUAD (cards → team)
  │
  ▼
VALIDATE SQUAD (must be ready for duel)
  │
  ▼
DUEL CHALLENGE (energy → battle → gems/points won)
  │
  ├─► WIN: +5 gems, +15 points, energy refund
  ├─► DRAW: +5 points
  └─► LOSE: +2 points
  │
  ▼
SHARE SQUAD (bonus: +20 soft / +50 hard first time)
  │
  ▼
EXCHANGE POINTS → GEMS (100 pts = 1 gem)
  │
  ▼
RETURN TO: OPEN PACK (cycle repeats)
```

---

## Appendix A: Rate Limits & Idempotency

| Endpoint | Rate Limit | Idempotency Key |
|----------|-----------|-----------------|
| `POST /duel/challenge` | 1× per key | `duel_<squad_id>_<key>` |
| `POST /points/exchange` | 1× per key | `exchange_<timestamp>` |
| `POST /daily-reward/claim` | 1× per day | `daily_<date>_<seq>` |
| `POST /share-log` | No limit (bonus 1× per day) | None required |

## Appendix B: Error Codes Summary

| Code | Meaning |
|------|---------|
| 400 | Bad request (claim duplikat, idempotency key dipakai) |
| 401 | Unauthorized (token tidak valid / expired) |
| 403 | Forbidden (kartu tidak milik user) |
| 404 | Not found (squad/opponent/pack tidak ditemukan) |
| 422 | Validation error (energy kurang, skuad belum siap, format salah) |

## Appendix C: Database Overview

| Collection/Table | Purpose |
|------------------|---------|
| `leagues` (MongoDB) | Referensi liga |
| `clubs` (MongoDB) | Referensi klub |
| `players` (MongoDB) | Data pemain + traits |
| `cards` (MongoDB) | Kartu yang bisa di-drop |
| `pack_catalogs` (MongoDB) | Katalog pack |
| `squads` (PostgreSQL/SQLite) | Tim user |
| `squad_players` (PostgreSQL/SQLite) | Kartu di skuad |
| `user_inventories` (PostgreSQL/SQLite) | Kartu milik user |
| `pack_opening_logs` (PostgreSQL/SQLite) | Log buka pack |
| `user_game_profiles` (PostgreSQL/SQLite) | Profile + currencies + energy |
| `duels` (PostgreSQL/SQLite) | Rekam duel |
| `duel_results` (PostgreSQL/SQLite) | Detail skor per posisi |
| `duel_energy_logs` (PostgreSQL/SQLite) | Log transaksi energy |
| `points_ledgers` (PostgreSQL/SQLite) | Riwayat points earn/spend |
| `daily_reward_claims` (PostgreSQL/SQLite) | Riwayat claim harian |
| `share_logs` (PostgreSQL/SQLite) | Riwayat share |
| `trait_synergy_pairs` (PostgreSQL/SQLite) | Pair trait yang memberi bonus chemistry |

---

## 10. FIFA ASEAN Cup Prediction (Milestone 9 — Bonus)

**Base URL:** `/api/v1/fifa-asean-cup`
**Database:** MongoDB (`fifa_asean_cup_matches`, `fifa_asean_cup_predictions`)

### 10.1 Point System

| Kondisi | Group Stage | Final |
|---------|-------------|-------|
| Exact score | 30 poin | 80 poin |
| Winner only | 15 poin | 40 poin |
| Salah | 0 poin | 0 poin |

### 10.2 Get Phases
**`GET /api/v1/fifa-asean-cup/phases`** — Tanpa auth

```json
// Response 200
{
  "success": true,
  "data": [
    {
      "id": "60d5phase...",
      "name": "Group Stage",
      "slug": "group-stage",
      "order": 1,
      "description": "8 tim dibagi 2 grup",
      "is_active": true,
      "matches_count": 12
    }
  ]
}
```

### 10.3 Get Teams
**`GET /api/v1/fifa-asean-cup/teams`** — Tanpa auth

Query params: `?grouped=true` (group teams by group letter)

```json
// Response 200 — grouped
{
  "success": true,
  "data": [
    {
      "group": "A",
      "teams": [
        {
          "id": "60d5team...",
          "name": "Thailand",
          "code": "THA",
          "fifa_code": "THA",
          "flag_emoji": "🇹🇭",
          "logo_url": "https://...",
          "country": "Thailand"
        }
      ]
    }
  ]
}
```

### 10.4 Get Matches
**`GET /api/v1/fifa-asean-cup/matches`** — Tanpa auth

Query params: `?phase=group-stage&group=A&matchday=1`

```json
// Response 200
{
  "success": true,
  "data": [
    {
      "id": "60d5match...",
      "home_team": { "id": "...", "name": "Thailand", "flag_emoji": "🇹🇭" },
      "away_team": { "id": "...", "name": "Vietnam", "flag_emoji": "🇻🇳" },
      "phase": { "id": "...", "name": "Group Stage", "slug": "group-stage" },
      "match_date": "2026-09-15T19:00:00Z",
      "kickoff_time": "19:00",
      "timezone": "Asia/Jakarta",
      "match_date_formatted": "Sep 15, 2026 19:00 WIB",
      "matchday": 1,
      "group": "A",
      "venue": "Stadion Gelora Bung Karno",
      "status": "scheduled",
      "is_prediction_open": true
    }
  ]
}
```

### 10.5 Get Match Detail
**`GET /api/v1/fifa-asean-cup/matches/{matchId}`** — Tanpa auth

```json
// Response 200
{
  "success": true,
  "data": {
    "id": "60d5match...",
    "home_team": { ... },
    "away_team": { ... },
    "match_date": "...",
    "status": "completed",
    "home_score": 2,
    "away_score": 1,
    "prediction_stats": { "total": 1523 }
  }
}
```

### 10.6 Get Leaderboard
**`GET /api/v1/fifa-asean-cup/leaderboard`** — Tanpa auth

```json
// Response 200 — belum ada match selesai
{ "success": true, "data": [] }

// Response 200 — ada data
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "user_id": "60d5user...",
      "user_name": "Ahmad",
      "profile_picture": "https://...",
      "total_points": 240,
      "total_predictions": 10,
      "exact_scores": 3
    }
  ]
}
```

### 10.7 Get Total Participants
**`GET /api/v1/fifa-asean-cup/total-participants`** — Tanpa auth

```json
{ "success": true, "data": { "total_participants": 12500, "total_predictions": 18750 } }
```

### 10.8 Get My Predictions
**`GET /api/v1/fifa-asean-cup/predictions`** `[Auth]`

Query params: `?phase_id=xxx&upcoming_only=true`

```json
// Response 200
{
  "success": true,
  "data": [
    {
      "id": "60d5pred...",
      "match_id": "60d5match...",
      "match": { "id": "...", "home_team": {...}, "away_team": {...}, "match_date": "...", "status": "scheduled" },
      "home_score_predicted": 2,
      "away_score_predicted": 1,
      "predicted_team": "Thailand",
      "predicted_result_label": "home_win",
      "status": "pending",
      "points_earned": null,
      "score_exact": null,
      "result_correct": null,
      "created_at": "2026-09-07T10:00:00.000Z"
    }
  ]
}
```

### 10.9 Get Matches With Prediction
**`GET /api/v1/fifa-asean-cup/matches-with-prediction`** `[Auth]`

Sama seperti `/matches` tapi setiap match dilampiri `prediction` user yang sedang login.

```json
// Response 200
{
  "success": true,
  "data": [
    {
      "match": { "id": "...", "home_team": {...}, "away_team": {...}, "status": "scheduled", ... },
      "prediction": {
        "id": "60d5pred...",
        "home_score_predicted": 2,
        "away_score_predicted": 1,
        "predicted_team": "Thailand",
        "status": "pending"
      }
    }
  ]
}
```

### 10.10 Submit Prediction
**`POST /api/v1/fifa-asean-cup/predict`** `[Auth]`

Submit atau update prediksi skor. Jika match sudah closed, ditolak 400.

```json
// Request body
{
  "match_id": "60d5match...",
  "home_score_predicted": 2,
  "away_score_predicted": 1
}

// Response 200
{
  "success": true,
  "message": "Prediction submitted successfully",
  "data": {
    "id": "60d5pred...",
    "match_id": "60d5match...",
    "home_score_predicted": 2,
    "away_score_predicted": 1,
    "predicted_team": "Thailand",
    "predicted_result_label": "home_win",
    "status": "pending"
  }
}

// Response 404 — match tidak ditemukan
{ "success": false, "message": "Match not found" }

// Response 400 — predictions closed
{ "success": false, "message": "Predictions are closed for this match" }
```

### 10.11 Get My Rank
**`GET /api/v1/fifa-asean-cup/me/rank`** `[Auth]`

```json
// Response 200 — belum ada match selesai
{ "success": true, "data": { "rank": 0, "total_points": 0, "total_participants": 0 } }

// Response 200 — ada ranking
{ "success": true, "data": { "rank": 3, "total_points": 185, "total_participants": 12500 } }
```

### 10.12 Get My Summary
**`GET /api/v1/fifa-asean-cup/me/summary`** `[Auth]`

Ringkasan performa user: total points, exact scores, accuracy, rank.

```json
// Response 200
{
  "success": true,
  "data": {
    "total_points": 185,
    "total_predictions": 8,
    "exact_scores": 2,
    "winner_correct": 4,
    "accuracy": 50.0,
    "live_rank": 3
  }
}
```

### 10.13 Publish Scores (Admin Only)
**`POST /api/v1/fifa-asean-cup/publish/scores`** `[Auth][Admin]`

Publikasi skor asli pertandingan. Setelah ini, semua prediksi untuk match tersebut dihitung otomatis.

```json
// Request body
{
  "match_id": "60d5match...",
  "home_score": 2,
  "away_score": 1
}

// Response 200
{
  "success": true,
  "message": "Scores published successfully",
  "data": {
    "match": { "home_team": "Thailand", "away_team": "Vietnam", "home_score": 2, "away_score": 1 },
    "predictions_calculated": 1250,
    "total_points_distributed": 18750
  }
}
```

---

## 11. Super Big Match Prediction (Milestone 9 — Bonus)

**Base URL:** `/api/v1/super-big-match`
**Database:** SQLite (mirip struktur FIFA ASEAN Cup)

### 11.1 Point System

| Kondisi | Poin |
|---------|------|
| Exact score | 50 poin |
| Winner only | 25 poin |
| Salah | 0 poin |

### 11.2 Get Teams
**`GET /api/v1/super-big-match/teams`** — Tanpa auth

```json
// Response 200
{
  "success": true,
  "data": [
    { "id": "PSJ", "name": "Paris Saint-Germain", "code": "PSJ", "logo_url": "https://..." },
    { "id": "PSB", "name": "Persib Bandung", "code": "PSB", "logo_url": null }
  ]
}
```

### 11.3 Get Matches
**`GET /api/v1/super-big-match/matches`** — Tanpa auth

Sama format response seperti FIFA ASEAN Cup `/matches`.

### 11.4 Get Match Detail
**`GET /api/v1/super-big-match/matches/{matchId}`** — Tanpa auth

Sama format response seperti FIFA ASEAN Cup `/matches/{matchId}`.

### 11.5 Get Leaderboard
**`GET /api/v1/super-big-match/leaderboard`** — Tanpa auth

Jika semua peserta dapat exact score (50), leaderboard di-shuffle secara acak.

```json
// Response 200
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "user_id": "...",
      "user_name": "Budi",
      "profile_picture": "https://...",
      "total_points": 50,
      "total_predictions": 1,
      "exact_scores": 1
    }
  ]
}
```

### 11.6 Get Total Participants
**`GET /api/v1/super-big-match/total-participants`** — Tanpa auth

Sama format seperti FIFA ASEAN Cup.

### 11.7 Get My Predictions
**`GET /api/v1/super-big-match/predictions`** `[Auth]`

Sama format response seperti FIFA ASEAN Cup `/predictions`.

### 11.8 Get Matches With Prediction
**`GET /api/v1/super-big-match/matches-with-prediction`** `[Auth]`

Sama format response seperti FIFA ASEAN Cup `/matches-with-prediction`.

### 11.9 Submit Prediction
**`POST /api/v1/super-big-match/predict`** `[Auth]`

Sama format request/response seperti FIFA ASEAN Cup `/predict`.

### 11.10 Get My Rank
**`GET /api/v1/super-big-match/me/rank`** `[Auth]`

Sama format response seperti FIFA ASEAN Cup `/me/rank`.

### 11.11 Get My Summary
**`GET /api/v1/super-big-match/me/summary`** `[Auth]`

Sama format response seperti FIFA ASEAN Cup `/me/summary`.

### 11.12 Publish Scores (Admin Only)
**`POST /api/v1/super-big-match/publish/scores`** `[Auth][Admin]`

Sama format request/response seperti FIFA ASEAN Cup `/publish/scores`.

---

*Dokumentasi Backend API Game Olahbola — Versi 1.0*
*Dicocokkan dengan sumber: routes/api.php, Controllers/, Services/*
*Ditambahkan: FIFA ASEAN Cup & Super Big Match Prediction API*
