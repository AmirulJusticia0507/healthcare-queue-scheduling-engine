# Healthcare Queue Scheduling Engine - Frontend

Frontend SPA untuk Healthcare Queue Scheduling Engine, dibangun dengan **React + Vite + Chakra UI**.

Berinteraksi dengan backend Express di `backend/` melalui REST API. Lihat `tables.md` untuk kontrak data dan `styles.md` untuk tema Chakra.

## Prasyarat

- Node.js 18+
- npm
- Backend berjalan (lihat `backend/package.json`)

## Setup

```bash
# buat project dari repo ini (direktori frontend)
cd frontend
npm create vite@latest . -- --template react
npm install

# dependency tambahan: axios + Chakra UI
npm install axios @chakra-ui/react @emotion/react @emotion/styled framer-motion
```

## Menjalankan

```bash
npm run dev
```

Secara default berjalan di `http://localhost:5173`. Backend di `http://localhost:5000`.

Bungkus aplikasi dengan `ChakraProvider` di `main.jsx` (Chakra UI v3):

```jsx
import { ChakraProvider } from '@chakra-ui/react';
import system from './theme';

createRoot(document.getElementById('root')).render(
  <ChakraProvider value={system}>
    <App />
  </ChakraProvider>
);
```

Untuk memakai Vite proxy ke backend, tambahkan di `vite.config.js`:

```js
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
});
```

## Konfigurasi API

Simpan base URL di file `.env` (root frontend):

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Contoh akses:

```js
const API = import.meta.env.VITE_API_BASE_URL;
```

## Fitur yang direncanakan

- Daftar dokter + tambah dokter
- Tampilan antrian pasien dengan estimasi waktu
- Join queue (tambah pasien)
- Skip & recall pasien
- Indikator status pasien (waiting / skipped / called / done)

## Struktur proyek (target)

```
frontend/
├── src/
│   ├── components/       # komponen reusable (QueueTable, StatusBadge, ...)
│   ├── pages/            # halaman (Doctors, Queue, ...)
│   ├── services/         # pemanggilan API
│   ├── hooks/            # custom hooks
│   ├── theme.js          # Chakra theme (lihat styles.md)
│   ├── App.jsx
│   └── main.jsx
├── README.md
├── guidelines.md         # aturan pengembangan
├── styles.md             # Chakra theme / design system
└── tables.md             # struktur data & tabel tampilan
```

## Endpoint backend yang dipakai

| Method | Endpoint               | Keterangan                      |
| ------ | ---------------------- | ------------------------------- |
| GET    | `/api/doctors`         | Daftar dokter                   |
| POST   | `/api/doctors`         | Tambah dokter                   |
| GET    | `/api/queue`           | Antrian + estimasi              |
| POST   | `/api/queue`           | Pasien join antrian             |
| PATCH  | `/api/queue/:id/skip`  | Skip pasien                     |
| PATCH  | `/api/queue/:id/recall`| Recall pasien yang di-skip      |
