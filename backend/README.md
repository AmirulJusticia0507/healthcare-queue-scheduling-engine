# Healthcare Queue Scheduling Engine - Backend

Backend REST API untuk Healthcare Queue Scheduling Engine, dibangun dengan **Node.js + Express 5 + PostgreSQL**.

## Fitur

- CRUD dokter (tambah, daftar)
- Manajemen antrian pasien (join, skip, recall)
- Estimasi waktu tunggu + penugasan dokter otomatis (greedy: dokter yang paling cepat free)
- `available_at` dokter dipersist di DB supaya jadwal konsisten antar request

## Prasyarat

- Node.js 18+
- PostgreSQL 14+

## Setup

```bash
cd backend
npm install
```

Siapkan database:

```bash
createdb healthcare_queue_db
psql -d healthcare_queue_db -f db/schema.sql
```

Tambahkan dokter awal (contoh):

```sql
INSERT INTO doctors (name, avg_consult_time) VALUES
('Dr. Sari', 15),
('Dr. Budi', 20);
```

### Konfigurasi `.env`

Salin nilai berikut ke `.env`:

```env
PORT=5000
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=healthcare_queue_db
DB_PORT=5432
```

## Menjalankan

```bash
npm run dev      # dengan nodemon (auto restart)
# atau
npm start        # production
```

Server berjalan di `http://localhost:5000`.

## API

### Doctors

| Method | Endpoint        | Deskripsi                  | Body                                 |
| ------ | --------------- | -------------------------- | ------------------------------------ |
| GET    | `/api/doctors`  | Daftar dokter              | -                                    |
| POST   | `/api/doctors`  | Tambah dokter              | `{ "name": "Dr. Budi", "avgConsultTime": 20 }` |

### Queue

| Method | Endpoint                  | Deskripsi                          |
| ------ | ------------------------- | ---------------------------------- |
| GET    | `/api/queue`              | Antrian + estimasi + dokter penugas |
| POST   | `/api/queue`              | Pasien join antrian (`{ "patientName": "Andi" }`) |
| PATCH  | `/api/queue/:id/skip`     | Skip pasien (dilewati)             |
| PATCH  | `/api/queue/:id/recall`   | Recall pasien yang di-skip         |

Contoh response `GET /api/queue`:

```json
[
  {
    "id": 1,
    "patient_name": "Andi",
    "status": "waiting",
    "joined_at": "2026-08-03T06:00:00.000Z",
    "estimatedTime": 0,
    "assignedDoctor": {
      "id": 1,
      "name": "Dr. Sari",
      "availableAt": 1785738000000
    }
  }
]
```

## Cara kerja estimasi

- Antrian diproses urut `joined_at`.
- Setiap pasien ditugaskan ke dokter yang `available_at`-nya paling cepat (`src/utils/queueEngine.js`).
- Setelah itu `available_at` dokter digeser sebesar `avg_consult_time`.
- Simulasi selalu dimulai dari baseline "semua dokter free di waktu sekarang" (`recalculateAvailability`), sehingga hasil `POST`/`GET`/`skip`/`recall` konsisten; hasil simulasi disimpan ke kolom `available_at` dokter untuk tampilan.
- `estimatedTime` = menit menunggu sampai dokter mulai menangani pasien tersebut.

## Struktur proyek

```
backend/
├── db/
│   └── schema.sql            # skema tabel doctors & queue_entries
├── src/
│   ├── app.js                # inisialisasi Express + mount routes
│   ├── server.js             # entry point
│   ├── config/
│   │   └── database.js       # koneksi PostgreSQL (pg Pool)
│   ├── modules/
│   │   ├── doctors/          # controller, routes, service
│   │   └── queue/            # controller, routes, service
│   └── utils/
│       └── queueEngine.js    # simulasi penjadwalan (simulateQueue)
└── package.json
```
