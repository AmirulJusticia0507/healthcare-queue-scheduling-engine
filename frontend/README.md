# Healthcare Queue Scheduling Engine - Frontend

Frontend SPA untuk Healthcare Queue Scheduling Engine, dibangun dengan **React + Vite + Tailwind CSS v4**.

Berinteraksi dengan backend Express di `backend/` melalui REST API. Lihat `tables.md` untuk kontrak data dan `styles.md` untuk sistem desain Tailwind.

## Prasyarat

- Node.js 18+
- npm
- Backend berjalan (lihat `backend/package.json`)

## Setup

```bash
cd frontend
npm create vite@latest . -- --template react
npm install

# dependency tambahan
npm install axios react-router-dom
npm install -D tailwindcss @tailwindcss/vite
```

## Menjalankan

```bash
npm run dev
```

Berinteraksi dengan backend lewat Vite proxy di `vite.config.js` (`/api` → `http://localhost:5000`), jadi di dev cukup panggil `/api/...`.

Buka `http://localhost:5173` (atau port berikutnya jika 5173 dipakai). Backend harus jalan di `http://localhost:5000`.

## Konfigurasi API

Base URL dikelola lewat Vite proxy (dev), sehingga service pakai path relatif `/api/...`. Jika butuh base yang bisa dikonfig, simpan di `.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Service `axios` default ke path relatif:

```js
const API = '/api'
export async function getQueue() {
  const res = await axios.get(`${API}/queue`)
  return res.data
}
```

## Fitur

- Dashboard ringkasan (jumlah menunggu, skip, dokter, estimasi)
- Daftar dokter + tambah dokter
- Tampilan antrian pasien dengan estimasi waktu
- Join queue (tambah pasien)
- Skip & recall pasien
- Indikator status pasien (waiting / skipped / called / done)
- Layout navbar + sidebar + footer (`AppLayout`)
- Notifikasi toast untuk aksi join/skip/recall/tambah dokter
- Dialog konfirmasi sebelum skip pasien
- **Login + JWT** (`admin@health.id`/`admin123`, `staff@health.id`/`staff123`); route dilindungi, token otomatis
- **Real-time** via SSE (`queue_update` pada join/skip/recall)
- **Riwayat antrian** paginasi + filter status/nama (`/history`)

## Struktur proyek

```
frontend/
├── src/
│   ├── layouts/           # AppLayout (navbar + sidebar + footer)
│   ├── components/        # komponen reusable (QueueTable, StatusBadge, Toasts, ...)
│   ├── pages/             # halaman (Dashboard, Queue, Doctors)
│   ├── services/          # pemanggilan API (axios)
│   ├── hooks/             # custom hooks (useQueue, useDoctors)
│   ├── lib/               # utilitas (toast store)
│   ├── App.jsx            # routing (react-router-dom)
│   └── main.jsx           # entry point
├── index.css              # @import "tailwindcss" + custom theme
├── vite.config.js         # proxy /api
├── README.md
├── guidelines.md          # aturan pengembangan
├── styles.md              # desain system (Tailwind)
└── tables.md              # struktur data & tabel tampilan
```

## Endpoint backend yang dipakai

| Method | Endpoint                | Keterangan                      | Auth         |
| ------ | ----------------------- | ------------------------------- | ------------ |
| POST   | `/api/auth/login`       | Login, kirim JWT                | publik       |
| GET    | `/api/auth/me`          | Profil user                     | butuh token  |
| GET    | `/api/doctors`          | Daftar dokter                   | butuh token  |
| POST   | `/api/doctors`          | Tambah dokter                   | admin only   |
| GET    | `/api/queue`            | Antrian + estimasi              | butuh token  |
| POST   | `/api/queue`            | Pasien join antrian             | butuh token  |
| PATCH  | `/api/queue/:id/skip`   | Skip pasien                     | butuh token  |
| PATCH  | `/api/queue/:id/recall` | Recall pasien yang di-skip      | butuh token  |
| GET    | `/api/queue/history`    | Riwayat (paginated/filter)      | butuh token  |
| GET    | `/api/queue/stream`     | SSE notifikasi live             | butuh token  |

## Build

```bash
npm run build
```
