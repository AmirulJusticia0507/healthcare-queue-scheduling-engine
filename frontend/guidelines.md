# Frontend Development Guidelines

Aturan pengembangan frontend React + Vite + Chakra UI untuk Healthcare Queue Scheduling Engine.

## Struktur folder

```
src/
├── components/   # komponen UI reusable & presentasional
├── pages/        # satu file per halaman/route
├── services/     # modul pemanggilan API (axios)
├── hooks/        # custom hooks (useQueue, useDoctors, ...)
├── theme.js      # Chakra theme (warna, font, ukuran — lihat styles.md)
├── App.jsx       # routing + layout utama
└── main.jsx      # entry point (bungkus ChakraProvider)
```

## Penamaan

- Komponen: **PascalCase** (`QueueTable`, `StatusBadge`)
- File service/hook: **camelCase** (`queueService.js`, `useQueue.js`)
- Nama file mengikuti nama export utama.

## Komponen

- Utamakan komponen Chakra UI bawaan (`Box`, `Flex`, `Table`, `Badge`, `Button`, `Input`, `Modal`, `useToast`, ...). Jangan bikin sendiri kalau Chakra sudah punya.
- Komponen **presentasional** (hanya render props) vs **container** (punya logika/state). Utamakan presentasional, pindahkan logika ke custom hook.
- Satu tanggung jawab per komponen.
- Jangan panggil API langsung dari komponen; lewat `services/`.
- Warna/font jangan di-hardcode pakai nilai mentah — selalu pakai token dari theme (mis. `color="brand.500"`), lihat `styles.md`.

## State management

- Mulai dengan state lokal (`useState`) dan custom hooks.
- Data yang sama dipakai banyak halaman/komponen → naikkan ke context.
- Hindari prop drilling > 2 level; pertimbangkan context atau refactor.

## Pemanggilan API

Buat service per domain di `src/services/`:

```js
// src/services/queueService.js
import axios from 'axios';

const API = import.meta.env.VITE_API_BASE_URL;

export async function getQueue() {
  const res = await axios.get(`${API}/queue`);
  return res.data;
}

export async function joinQueue(patientName) {
  const res = await axios.post(`${API}/queue`, { patientName });
  return res.data;
}

export async function skipPatient(id) {
  const res = await axios.patch(`${API}/queue/${id}/skip`);
  return res.data;
}

export async function recallPatient(id) {
  const res = await axios.patch(`${API}/queue/${id}/recall`);
  return res.data;
}
```

- Semua pemanggilan async di-handling dengan try/catch (atau wrapper `asyncHandler`).
- Tampilkan error dengan `useToast` dari Chakra, jangan biarkan error mentah.
- Selalu loading state saat request berjalan (mis. `Button isLoading`).

## Gaya kode

- Prettier untuk format (double quotes, semicolon, trailing comma).
- ESLint + plugin React.
- Pakai functional components + hooks; hindari class components.
- Tidak ada komentar berlebihan; gunakan komentar hanya untuk menjelaskan *kenapa*.

## Git workflow

- Commit kecil dengan pesan deskriptif.
- Sinkronkan dengan kontrak API: jika backend mengubah response, update `tables.md` lalu sesuaikan service.
