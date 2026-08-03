# Tables & Data Contract

Dokumentasi struktur data untuk frontend: apa yang datang dari backend dan bagaimana menampilkannya.

Base URL: `http://localhost:5000/api` (lihat `frontend/README.md`).

## 1. Doctors

**Endpoint:** `GET /api/doctors`, `POST /api/doctors`

### Response GET `/api/doctors`

```json
[
  {
    "id": 1,
    "name": "Dr. Sari",
    "avg_consult_time": 15,
    "available_at": "2026-08-03T04:00:00.000Z",
    "created_at": "2026-08-03T03:00:00.000Z"
  }
]
```

| Field             | Tipe   | Keterangan                              |
| ----------------- | ------ | --------------------------------------- |
| id                | number | Primary key                             |
| name              | string | Nama dokter                             |
| avg_consult_time  | number | Rata-rata durasi konsultasi (menit)     |
| available_at      | string | Kapan dokter bebas lagi (ISO 8601)      |
| created_at        | string | Waktu dibuat (ISO 8601)                 |

### Request POST `/api/doctors`

```json
{
  "name": "Dr. Budi",
  "avgConsultTime": 20
}
```

Body yang dikirim pakai `avgConsultTime` (camelCase), namun respons mengembalikan `avg_consult_time` (snake_case).

### Tabel tampilan (Doctors)

| No | Nama Dokter | Konsultasi (mnt) | Tersedia Kembali | Aksi |
| -- | ----------- | ---------------- | ---------------- | ---- |
| 1  | Dr. Sari    | 15               | 11:00            | -    |

## 2. Queue

**Endpoint:** `GET /api/queue`, `POST /api/queue`, `PATCH /api/queue/:id/skip`, `PATCH /api/queue/:id/recall`

### Response GET `/api/queue`

```json
[
  {
    "id": 1,
    "patient_name": "Andi",
    "status": "waiting",
    "joined_at": "2026-08-03T03:05:00.000Z",
    "created_at": "2026-08-03T03:05:00.000Z",
    "estimatedTime": 10,
    "assignedDoctor": {
      "id": 1,
      "name": "Dr. Sari",
      "availableAt": 1722670200000
    }
  }
]
```

| Field           | Tipe    | Keterangan                                  |
| --------------- | ------- | ------------------------------------------- |
| id              | number  | Primary key                                 |
| patient_name    | string  | Nama pasien                                 |
| status          | string  | `waiting` \| `skipped` \| `called` \| `done` |
| joined_at       | string  | Waktu masuk antrian (ISO 8601)              |
| estimatedTime   | number  | Estimasi tunggu dalam **menit** (dihitung backend) |
| assignedDoctor  | object  | Dokter yang ditugaskan + kapan bebas        |
| assignedDoctor.id | number  | Id dokter                                 |
| assignedDoctor.name | string | Nama dokter                             |
| assignedDoctor.availableAt | number | Waktu dokter bebas, **timestamp ms** |

> Catatan: `assignedDoctor.availableAt` berupa timestamp dalam milidetik. Konversi ke format tampilan: `new Date(availableAt).toLocaleTimeString()`.

### Request POST `/api/queue`

```json
{ "patientName": "Budi" }
```

### Response POST `/api/queue` (201)

```json
{
  "entry": {
    "id": 3,
    "patient_name": "Budi",
    "status": "waiting",
    "estimatedTime": 25,
    "assignedDoctor": { "id": 2, "name": "Dr. Budi", "availableAt": 1722670500000 }
  },
  "estimatedTime": 25
}
```

### Response PATCH `/api/queue/:id/skip` & `/recall`

Mengembalikan entry yang diubah:

```json
{
  "id": 3,
  "patient_name": "Budi",
  "status": "skipped",
  "joined_at": "2026-08-03T03:05:00.000Z"
}
```

Error jika id tidak ditemukan:

```json
{ "error": "Patient not found" }
```

### Tabel tampilan (Queue)

| No | Nama Pasien | Status    | Estimasi | Dokter Ditugaskan | Join Pada |
| -- | ----------- | --------- | -------- | ----------------- | --------- |
| 1  | Andi        | waiting   | 10 mnt   | Dr. Sari (11:00)  | 10:05     |
| 2  | Budi        | skipped   | -        | -                 | 10:06     |

Kolom status ditampilkan sebagai badge berwarna (lihat `styles.md`).

### Aksi per baris queue

| Aksi  | Endpoint                    | Catatan                    |
| ----- | --------------------------- | -------------------------- |
| Skip  | `PATCH /api/queue/:id/skip` | Status jadi `skipped`, dokter otomatis dibebaskan |
| Recall | `PATCH /api/queue/:id/recall` | Status kembali `waiting` |

## 3. Map status

| Status   | Arti                              | Badge color (styles.md) |
| -------- | --------------------------------- | ----------------------- |
| waiting  | Sedang menunggu giliran           | warning                 |
| skipped  | Dilewati sementara                | danger                  |
| called   | Sudah dipanggil ke dokter         | info                    |
| done     | Konsultasi selesai                | success                 |

## Format & konvensi untuk frontend

- Backend mengirim **snake_case** untuk kolom DB (`patient_name`, `avg_consult_time`, `joined_at`).
- Backend menghitung field turunan **camelCase** (`estimatedTime`, `assignedDoctor`).
- Timestamp: kolom DB berupa **ISO 8601 string**, `availableAt` berupa **timestamp ms** — perlakukan sesuai tipe masing-masing saat konversi.
- Jika backend mengubah response, update file ini agar kontrak tetap sinkron.
