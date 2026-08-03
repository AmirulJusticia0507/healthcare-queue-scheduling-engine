# Style Guide (Tailwind CSS v4)

Panduan tampilan frontend Healthcare Queue Scheduling Engine berbasis **Tailwind CSS**.

Konfigurasi di `src/index.css`:

```css
@import "tailwindcss";

@theme {
  --color-brand-50: #eff6ff;
  --color-brand-500: #2563eb;
  --color-brand-600: #1d4ed8;
  --color-brand-700: #1e40af;
}
```

> Kita pakai utility class langsung (misal `bg-brand-600`, `text-sm`) — tidak ada konsep *component variant* seperti Chakra. Semua gaya ada di JSX.

## Kesan

Bersih, tenang, dapat dipercaya (sesuai konteks kesehatan).

## Palet warna

| Token        | Kelas Tailwind        | Hex       | Penggunaan                            |
| ------------ | --------------------- | --------- | ------------------------------------- |
| brand        | `brand-500/600/700`   | `#2563eb` | Tombol utama, link, aksen aktif       |
| success      | `emerald-500/600`     | `#16a34a` | Status `done`                         |
| warning      | `amber-500/600`       | `#f59e0b` | Status `waiting`                      |
| danger       | `red-500/600`         | `#dc2626` | Status `skipped`, aksi skip           |
| info         | `gray-500/600`        | `#6b7280` | Status `called` (dipanggil)           |
| Background   | `gray-50`             | `#f8fafc` | Latar halaman → `bg-gray-50`          |
| Surface      | `white`               | `#ffffff` | Kartu, tabel, header → `bg-white`     |
| Text utama   | `gray-900`            | `#111827` | `text-gray-900`                       |
| Text-muted   | `gray-500`            | `#6b7280` | `text-gray-500`                       |
| Border       | `gray-200`            | `#e2e8f0` | `border-gray-200`                     |

## Typography

| Pemakaian      | Tailwind class                          |
| -------------- | --------------------------------------- |
| Teks body/kecil| `text-xs` / `text-sm`                   |
| Teks utama     | `text-base`                             |
| Subheading     | `text-lg font-semibold`                 |
| Judul halaman  | `text-xl font-bold`                     |
| Judul utama    | `text-2xl font-bold`                    |

## Primitives reusable

### Badge status (`StatusBadge`)

```jsx
const STATUS_STYLES = {
  waiting: 'bg-amber-100 text-amber-800 border-amber-200',
  skipped: 'bg-red-100 text-red-700 border-red-200',
  called: 'bg-gray-100 text-gray-700 border-gray-200',
  done: 'bg-emerald-100 text-emerald-700 border-emerald-200',
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${
        STATUS_STYLES[status] || 'bg-gray-100 text-gray-700 border-gray-200'
      }`}
    >
      {status}
    </span>
  )
}
```

### Input

```html
<input className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500" />
```

### Tombol

- Primary: `bg-brand-600 text-white hover:bg-brand-700`
- Danger/skip: `border border-red-300 text-red-600 hover:bg-red-50`
- Ringan/outline: `border border-gray-300 text-gray-700 hover:bg-gray-100`
- Semua tombol: `px-2.5 py-1.5 rounded-md font-medium text-xs`, tambahkan `disabled:opacity-50` saat loading.

### Card / surface

```html
<div class="bg-white rounded-lg border border-gray-200 p-4">…</div>
```

### Tabel

Pakai elemen native `<table>` Tailwind:

```html
<div class="bg-white rounded-lg border border-gray-200 overflow-x-auto">
  <table class="w-full text-sm">
    <thead>
      <tr class="text-left text-gray-500 border-b border-gray-200">
        <th class="px-4 py-2 font-medium">Nama</th>
      </tr>
    </thead>
    <tbody>
      <tr class="border-b border-gray-100 last:border-0">
        <td class="px-4 py-2">…</td>
      </tr>
    </tbody>
  </table>
</div>
```

## Layout

- Batas lebar konten: `max-w-6xl mx-auto`.
- Halaman vertikal: `space-y-4`.
- Sidebar responsif: `w-full md:w-56` (flex-col desktop, flex-wrap mobile).

## Responsive

- Mobile-first dengan breakpoint `sm`, `md`, `lg`, `xl`.
- Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`.
- Tabel panjang: bungkus `overflow-x-auto`.
