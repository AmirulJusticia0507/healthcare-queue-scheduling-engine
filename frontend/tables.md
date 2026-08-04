# Tables & Data Contract

Dokumentasi struktur data untuk frontend: apa yang datang dari backend dan bagaimana menampilkannya.

Base URL backend: `http://localhost:5000/api` (di dev lewat **Vite proxy** jadi `/api/...`).

> Semua route kecuali `/api/auth/login` memerlukan header `Authorization: Bearer <JWT>`.
> Frontend menyimpan token di `localStorage` dan axios menambahkannya otomatis.

## 0. Auth

**Endpoint:** `POST /api/auth/login`, `GET /api/auth/me`

### Request POST `/api/auth/login`

```json
{ "email": "admin@health.id", "password": "admin123" }
```

### Response 200

```json
{
  "user": { "id": 1, "name": "Admin", "email": "admin@health.id", "role": "admin" },
  "token": "<jwt>"
}
```

- Rate-limited: maks **5 percobaan / 15 menit** per IP. Response `429` berisi `retrySeconds`.
- Akun demo: `admin@health.id`/`admin123` (role `admin`), `staff@health.id`/`staff123` (role `staff`).

### Roles / perizinan

| Role  | Lihat dokter | Tambah dokter | Lihat/skip/recall antrian | Riwayat |
| ----- | ------------ | ------------- | ------------------------- | ------- |
| admin | ✓            | ✓             | ✓                         | ✓       |
| staff | ✓            | ✗             | ✓                         | ✓       |

Frontend menyembunyikan form *Tambah Dokter* (beserta toast/peringatan) bila bukan admin.

### SSE real-time

`GET /api/queue/stream?token=<jwt>` — *Server-Sent Events*. Event `queue_update` dikirim saat ada
pasien join/skip/recall. Frontend membuka `EventSource` di halaman Antrian & Dashboard lalu *refresh*.

```js
const source = new EventSource(`/api/queue/stream?token=${encodeURIComponent(token)}`)
source.addEventListener('queue_update', () => reload())
```

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

| Field            | Tipe   | Keterangan                              |
| ---------------- | ------ | --------------------------------------- |
| id               | number | Primary key                             |
| name             | string | Nama dokter                             |
| avg_consult_time | number | Rata-rata durasi konsultasi (menit)     |
| available_at     | string | Kapan dokter bebas lagi (ISO 8601)      |
| created_at       | string | Waktu dibuat (ISO 8601)                 |

### Request POST `/api/doctors`

```json
{
  "name": "Dr. Budi",
  "avgConsultTime": 20
}
```

Body pakai `avgConsultTime` (camelCase); respons kembalikan `avg_consult_time` (snake_case).

### Tabel tampilan (Doctors)

| No | Nama Dokter | Konsultasi (mnt) | Tersedia Kembali |
| -- | ----------- | ---------------- | ---------------- |
| 1  | Dr. Sari    | 15               | 11:00            |

Render dengan Tailwind (lihat `DoctorsTable.jsx`):

```jsx
<div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
  <table className="w-full text-sm">
    <thead>
      <tr className="text-left text-gray-500 border-b border-gray-200">
        <th className="px-4 py-2 font-medium">Nama Dokter</th>
        <th className="px-4 py-2 font-medium">Konsultasi (mnt)</th>
        <th className="px-4 py-2 font-medium">Tersedia Kembali</th>
      </tr>
    </thead>
    <tbody>
      {doctors.map((d) => (
        <tr key={d.id} className="border-b border-gray-100 last:border-0">
          <td className="px-4 py-2 font-medium">{d.name}</td>
          <td className="px-4 py-2">{d.avg_consult_time}</td>
          <td className="px-4 py-2">{formatAvailable(d.available_at)}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

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

| Field                    | Tipe   | Keterangan                                       |
| ------------------------ | ------ | ------------------------------------------------ |
| id                       | number | Primary key                                      |
| patient_name             | string | Nama pasien                                      |
| status                   | string | `waiting` \| `skipped` \| `called` \| `done`     |
| joined_at                | string | Waktu masuk antrian (ISO 8601)                   |
| estimatedTime            | number | Estimasi tunggu dalam **menit** (dihitung backend) |
| assignedDoctor           | object | Dokter yang ditugaskan + kapan bebas             |
| assignedDoctor.id        | number | Id dokter                                        |
| assignedDoctor.name      | string | Nama dokter                                      |
| assignedDoctor.availableAt | number | Waktu dokter bebas, **timestamp ms**          |

> Catatan: `assignedDoctor.availableAt` berupa timestamp dalam milidetik. Konversi ke tampilan: `new Date(availableAt).toLocaleTimeString('id-ID', {hour:'2-digit',minute:'2-digit'})`.

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

Error kalau id tidak ditemukan:

```json
{ "error": "Patient not found" }
```

### Tabel tampilan (Queue)

| No | Nama Pasien | Status    | Estimasi | Dokter Ditugaskan | Aksi  |
| -- | ----------- | --------- | -------- | ----------------- | ----- |
| 1  | Andi        | waiting   | 10 mnt   | Dr. Sari (11:00)  | Skip  |
| 2  | Budi        | skipped   | -        | -                 | Recall|

Render + aksi (lihat `QueueTable.jsx`):

```jsx
<td className="px-4 py-2">
  {p.status === 'waiting' ? (
    <button
      type="button"
      onClick={() => setSkipTarget(p)}
      className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md border border-red-300 text-red-600 hover:bg-red-50"
    >
      Skip
    </button>
  ) : (
    <button
      type="button"
      onClick={() => onRecall(p.id)}
      className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md border border-emerald-300 text-emerald-600 hover:bg-emerald-50"
    >
      Recall
    </button>
  )}
</td>
```

`StatusBadge` pakai kelas `span` Tailwind, bukan `Badge` Chakra (lihat `styles.md`).

### Aksi per baris queue

| Aksi   | Endpoint                    | Catatan                                  |
| ------ | --------------------------- | ---------------------------------------- |
| Skip   | `PATCH /api/queue/:id/skip` | Status jadi `skipped`, dokter otomatis dibebaskan |
| Recall | `PATCH /api/queue/:id/recall` | Status kembali `waiting`               |

### Endpoint tambahan (Queue)

| Method | Endpoint               | Keterangan                                              | Auth         |
| ------ | ---------------------- | ------------------------------------------------------ | ------------ |
| GET    | `/api/queue/history`   | Semua entri (waiting/skipped/called/done), paginasi. Query: `status`, `q`, `page`, `limit` | butuh token  |
| GET    | `/api/queue/stream`    | SSE live (`queue_update`). Token lewat query `?token=`.                 | butuh token  |

Response `GET /api/queue/history`:

```json
{ "items": [...], "total": 12, "page": 1, "limit": 20, "totalPages": 1 }
```



## 3. Map status

| Status   | Arti                        | Tailwind (styles.md)       |
| -------- | --------------------------- | -------------------------- |
| waiting  | Sedang menunggu giliran     | `amber-100 / text-amber-800` |
| skipped  | Dilewati sementara          | `red-100 / text-red-700`   |
| called   | Sudah dipanggil ke dokter   | `gray-100 / text-gray-700` |
| done     | Konsultasi selesai          | `emerald-100 / text-emerald-700` |

## Format & konvensi untuk frontend

- Backend kirim **snake_case** untuk kolom DB (`patient_name`, `avg_consult_time`, `joined_at`).
- Backend hitung field turunan **camelCase** (`estimatedTime`, `assignedDoctor`).
- Timestamp: kolom DB berupa **ISO 8601 string**; `availableAt` berupa **timestamp ms** — konversi sesuai tipe masing-masing saat memakai.
- Jika backend ganti response, update file ini agar kontrak tetap sinkron.
