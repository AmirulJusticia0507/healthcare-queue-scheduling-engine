# Style Guide (Chakra UI Theme)

Panduan tampilan frontend Healthcare Queue Scheduling Engine berbasis **Chakra UI**.

Definisikan seluruh token di `src/theme.js` lalu gunakan `ChakraProvider theme={theme}` di `main.jsx` (lihat `README.md`).

## Tema

Kesan bersih, tenang, dan dapat dipercaya (sesuai konteks kesehatan).

## Palet warna

| Token      | Chakra scale | Hex       | Penggunaan                                |
| ---------- | ------------ | --------- | ----------------------------------------- |
| brand      | `brand.500`  | `#2563eb` | Tombol utama, link, aksen aktif           |
| brand      | `brand.600`  | `#1d4ed8` | Hover/aktif tombol utama                  |
| secondary  | `secondary.500` | `#0ea5e9` | Aksen sekunder, highlight               |
| success    | `green`      | `#16a34a` | Status `done`, sukses                     |
| warning    | `orange`     | `#f59e0b` | Status `waiting`                          |
| danger     | `red`        | `#dc2626` | Status `skipped`, aksi hapus/skip         |
| info       | `gray`       | `#6b7280` | Status `called` (dipanggil)               |
| Background | `gray.50`    | `#f8fafc` | Latar halaman                             |
| Surface    | `white`      | `#ffffff` | Kartu, tabel, header                      |
| Text       | `gray.900`   | `#0f172a` | Teks utama                                |
| Text-muted | `gray.500`   | `#64748b` | Teks sekunder / placeholder               |
| Border     | `gray.200`   | `#e2e8f0` | Garis tabel, divider                      |

### `src/theme.js`

```js
import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    brand: {
      50: '#eff6ff',
      100: '#dbeafe',
      500: '#2563eb',
      600: '#1d4ed8',
      700: '#1e40af',
    },
    secondary: {
      500: '#0ea5e9',
    },
  },
  fonts: {
    body: `system-ui, 'Segoe UI', sans-serif`,
    heading: `system-ui, 'Segoe UI', sans-serif`,
  },
  fontSizes: {
    badge: '12px',
    sm: '14px',
    md: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
  },
  radii: {
    button: '6px',
    card: '8px',
    modal: '12px',
  },
  shadows: {
    card: '0 1px 3px rgba(0, 0, 0, 0.08)',
  },
});

export default theme;
```

## Typography

| Pemakaian      | Chakra          | Keterangan                |
| -------------- | --------------- | ------------------------- |
| Font body      | `fontSize="sm"` | Tabel, deskripsi          |
| Teks utama     | `fontSize="md"` | Paragraf                  |
| Subheading     | `fontSize="lg"` | `fontWeight="semibold"`   |
| Judul halaman  | `fontSize="xl"` | `fontWeight="bold"`       |
| Judul utama    | `fontSize="2xl"`| Halaman hero              |
| Badge / meta   | `fontSize="badge"` | Label kecil            |

Gunakan komponen `Heading` untuk judul, `Text` untuk paragraf, dengan `color` dari token theme.

## Spacing & radius

- Spacing: skala 4px Chakra (`2=8px`, `4=16px`, `6=24px`, `8=32px`).
- Radius: pakai token `borderRadius="button"` / `card` / `modal` dari theme.
- Kartu: `bg="white"` + `shadow="card"` + `borderRadius="card"`.

## Komponen Chakra yang dipakai

### Tombol (`Button`)

- Primary: `<Button colorScheme="brand">`
- Danger/skip: `<Button colorScheme="red">`
- Ringan: `<Button variant="ghost">` atau `variant="outline"`
- Loading: `<Button isLoading>`
- Ukuran: `size="sm"` untuk aksi di tabel, `size="md"` default.

### Badge status (`Badge`)

| Status   | Chakra            |
| -------- | ----------------- |
| waiting  | `colorScheme="orange"` |
| skipped  | `colorScheme="red"`    |
| called   | `colorScheme="gray"`   |
| done     | `colorScheme="green"`  |

```jsx
const STATUS_SCHEME = {
  waiting: 'orange',
  skipped: 'red',
  called: 'gray',
  done: 'green',
};

function StatusBadge({ status }) {
  return <Badge colorScheme={STATUS_SCHEME[status]}>{status}</Badge>;
}
```

### Form

- `Input`, `Select`, `FormControl` + `FormLabel`.
- State error: `isInvalid` + `FormErrorMessage` (warna otomatis `red`).
- Fokus otomatis di-styling Chakra.

### Feedback

- Pakai `useToast` untuk notifikasi sukses/error aksi (join, skip, recall, tambah dokter).
- Konfirmasi aksi skip/hapus: `useDisclosure` + `Modal`/`AlertDialog`.

## Layout

- `Container` untuk batas lebar konten.
- Halaman: `VStack`/`Stack` untuk susunan vertikal, `Flex` untuk baris.
- Kartu: `Box` dengan `bg`, `shadow`, `borderRadius` token di atas.

## Responsive

- Pakai props responsive Chakra: `w={{ base: '100%', md: '50%' }}`, `flexDir={{ base: 'column', md: 'row' }}`.
- Tabel panjang: bungkus dengan `Box overflowX="auto"` untuk scroll horizontal di layar kecil.
