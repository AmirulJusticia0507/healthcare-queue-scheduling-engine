# Style Guide (Chakra UI Theme)

Panduan tampilan frontend Healthcare Queue Scheduling Engine berbasis **Chakra UI v3**.

Definisikan token di `src/theme.js` (pakai `createSystem` + `defineConfig`) lalu gunakan `ChakraProvider value={system}` di `main.jsx` (lihat `README.md`).

## Tema

Kesan bersih, tenang, dan dapat dipercaya (sesuai konteks kesehatan).

## Palet warna

| Token      | Chakra colorPalette | Hex       | Penggunaan                            |
| ---------- | ------------------- | --------- | ------------------------------------- |
| brand      | `brand`             | `#2563eb` | Tombol utama, link, aksen aktif       |
| secondary  | `secondary`         | `#0ea5e9` | Aksen sekunder, highlight             |
| success    | `green`             | `#16a34a` | Status `done`, sukses                 |
| warning    | `orange`            | `#f59e0b` | Status `waiting`                      |
| danger     | `red`               | `#dc2626` | Status `skipped`, aksi hapus/skip     |
| info       | `gray`              | `#6b7280` | Status `called` (dipanggil)           |
| Background | `gray.50`           | `#f8fafc` | Latar halaman                         |
| Surface    | `white`             | `#ffffff` | Kartu, tabel, header                  |
| Text       | `gray.900`          | `#0f172a` | Teks utama                            |
| Text-muted | `gray.500`          | `#64748b` | Teks sekunder / placeholder           |
| Border     | `gray.200`          | `#e2e8f0` | Garis tabel, divider                  |

### `src/theme.js`

```js
import { createSystem, defineConfig } from '@chakra-ui/react';

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: '#eff6ff' },
          100: { value: '#dbeafe' },
          500: { value: '#2563eb' },
          600: { value: '#1d4ed8' },
          700: { value: '#1e40af' },
        },
        secondary: {
          500: { value: '#0ea5e9' },
        },
      },
    },
  },
});

const system = createSystem(config);

export default system;
```

## Typography

| Pemakaian     | Chakra           | Keterangan              |
| ------------- | ---------------- | ----------------------- |
| Font body     | `fontSize="sm"`  | Tabel, deskripsi        |
| Teks utama    | `fontSize="md"`  | Paragraf                |
| Subheading    | `fontSize="lg"`  | `fontWeight="semibold"` |
| Judul halaman | `fontSize="xl"`  | `fontWeight="bold"`     |
| Judul utama   | `fontSize="2xl"` | Halaman hero            |

Gunakan komponen `Heading` untuk judul, `Text` untuk paragraf, dengan `color` dari token theme.

## Komponen Chakra yang dipakai

### Tombol (`Button`)

- Primary: `<Button colorPalette="brand">`
- Danger/skip: `<Button colorPalette="red">`
- Ringan: `<Button variant="outline">`
- Loading: `<Button loading>`
- Ukuran: `size="xs"`/`sm` untuk aksi di tabel, `size="md"` default.

### Badge status (`Badge`)

| Status   | Chakra `colorPalette` |
| -------- | --------------------- |
| waiting  | `orange`              |
| skipped  | `red`                 |
| called   | `gray`                |
| done     | `green`               |

```jsx
const STATUS_COLOR_PALETTE = {
  waiting: 'orange',
  skipped: 'red',
  called: 'gray',
  done: 'green',
};

function StatusBadge({ status }) {
  return (
    <Badge colorPalette={STATUS_COLOR_PALETTE[status] || 'gray'} variant="subtle">
      {status}
    </Badge>
  );
}
```

### Tabel (`Table`)

Gunakan komposisi v3:

```jsx
<Table.Root size="sm" variant="line">
  <Table.Header>
    <Table.Row>
      <Table.ColumnHeader>Nama</Table.ColumnHeader>
    </Table.Row>
  </Table.Header>
  <Table.Body>
    <Table.Row>
      <Table.Cell>...</Table.Cell>
    </Table.Row>
  </Table.Body>
</Table.Root>
```

### Form

- `Field.Root` + `Field.Label` (menggantikan `FormControl`/`FormLabel`).
- Input: `Input`, number: `NumberInput.Root` + `NumberInput.Input`.
- State error: `Field.Root invalid` + `Field.ErrorText`.
- Fokus otomatis di-styling Chakra.

### Feedback

- Pakai `toaster`/`useToast` untuk notifikasi sukses/error aksi (join, skip, recall, tambah dokter).
- Konfirmasi aksi skip/hapus: `Dialog.Root` atau `AlertDialog`.

## Layout

- `Container` (`maxW="4xl"`) untuk batas lebar konten.
- Halaman: `Stack`/`VStack` untuk susunan vertikal, `HStack`/`Flex` untuk baris.
- Tabs: `Tabs.Root` + `Tabs.List` + `Tabs.Trigger` + `Tabs.Content` (pakai `value`/`defaultValue`).

## Responsive

- Pakai props responsive Chakra: `w={{ base: '100%', md: '50%' }}`, `flexDir={{ base: 'column', md: 'row' }}`.
- Tabel panjang: `Table.Root overflowX="auto"` untuk scroll horizontal di layar kecil.
