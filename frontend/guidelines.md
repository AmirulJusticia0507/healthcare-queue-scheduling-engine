# Frontend Development Guidelines

Aturan pengembangan frontend React + Vite + **Tailwind CSS** untuk Healthcare Queue Scheduling Engine.

## Struktur folder

```
src/
├── components/   # komponen UI reusable & presentasional
├── pages/        # satu file per halaman/route
├── services/     # modul pemanggilan API (axios)
├── hooks/        # custom hooks (useQueue, useDoctors, ...)
├── layouts/      # AppLayout (navbar + sidebar + footer)
├── lib/          # utilitas (toast store)
├── App.jsx       # routing (react-router-dom)
└── main.jsx      # entry point
```

## Penamaan

- Komponen: **PascalCase** (`QueueTable`, `StatusBadge`)
- File service/hook: **camelCase** (`queueService.js`, `useQueue.js`)
- Nama file mengikuti nama export utama.

## Styling

- Pakai **Tailwind CSS utility classes** (lihat `styles.md`).
- Jangan hardcode warna/padding langsung — pakai kelas Tailwind atau token custom (`brand-500`, dsb.).
- Komponen presentasional vs container: pindahkan logika ke custom hook; komponen cukup render props.
- Satu tanggung jawab per komponen.
- Jangan panggil API langsung dari komponen; lewat `services/`.

## Toasts & feedback

- Notifikasi pakai `pushToast({ title, description, type })` dari `src/lib/toast.js`; dirender oleh `<Toasts />` di `AppLayout`. `type: 'success' | 'error'`.

## Konfirmasi aksi

- Konfirmasi skip pakai overlay dialog sederhana (fixed backdrop) — lihat `QueueTable.jsx`.

## State management

- Mulai dengan state lokal (`useState`) dan custom hooks.
- Data yang sama dipakai banyak komponen → naikkan ke context bila perlu.

## Pemanggilan API

Buat service per domain di `src/services/`, pakai `axios` dengan path relatif `/api/...`:

```js
import axios from 'axios'
const API = '/api'

export async function getQueue() {
  const res = await axios.get(`${API}/queue`)
  return res.data
}
```

- Semua pemanggilan async ditangkap try/catch di caller; tampilkan error lewat toast.
- Tampilkan state loading saat request berjalan.

## Gaya kode

- Double quotes, semicolon, trailing comma (Prettier default).
- `oxlint` untuk lint.
- Functional components + hooks.
- Komentar hanya untuk menjelaskan *kenapa*.

## Git workflow

- Commit kecil, pesan deskriptif.
- Sinkronkan kontrak API: kalau backend ganti response, update `tables.md` lalu sesuaikan service.
