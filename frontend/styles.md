# Style Guide (Design System)

Panduan tampilan frontend Healthcare Queue Scheduling Engine.

## Tema

Kesan bersih, tenang, dan dapat dipercaya (sesuai konteks kesehatan).

## Palet warna

| Token      | Hex       | Penggunaan                                    |
| ---------- | --------- | --------------------------------------------- |
| Primary    | `#2563eb` | Tombol utama, link, aksen aktif               |
| Primary-dark | `#1d4ed8` | Hover/aktif tombol utama                      |
| Secondary  | `#0ea5e9` | Aksen sekunder, highlight                      |
| Success    | `#16a34a` | Status `done`, sukses                          |
| Warning    | `#f59e0b` | Status `waiting` / antrian                     |
| Danger     | `#dc2626` | Status `skipped`, aksi hapus/skip              |
| Info       | `#6b7280` | Status `called` (dipanggil)                   |
| Background | `#f8fafc` | Latar halaman                                 |
| Surface    | `#ffffff` | Kartu, tabel, header                          |
| Text       | `#0f172a` | Teks utama                                    |
| Text-muted | `#64748b` | Teks sekunder / placeholder                   |
| Border     | `#e2e8f0` | Garis tabel, divider                          |

Definisikan sebagai CSS variables di `src/index.css`:

```css
:root {
  --color-primary: #2563eb;
  --color-primary-dark: #1d4ed8;
  --color-secondary: #0ea5e9;
  --color-success: #16a34a;
  --color-warning: #f59e0b;
  --color-danger: #dc2626;
  --color-info: #6b7280;
  --color-background: #f8fafc;
  --color-surface: #ffffff;
  --color-text: #0f172a;
  --color-text-muted: #64748b;
  --color-border: #e2e8f0;
}
```

## Typography

| Token        | Nilai                     | Penggunaan                  |
| ------------ | ------------------------- | --------------------------- |
| Font family  | system-ui / Inter         | Seluruh UI                  |
| `text-xs`    | 12px                      | Badge, meta info            |
| `text-sm`    | 14px                      | Tabel, deskripsi            |
| `text-base`  | 16px                      | Teks utama                  |
| `text-lg`    | 18px                      | Subheading                  |
| `text-xl`    | 20px                      | Judul halaman               |
| `text-2xl`   | 24px                      | Judul utama (hero)          |

Line-height `1.5` untuk body, `1.3` untuk heading. Heading tebal (`600`).

## Spacing & radius

- Spacing: pakai skala 4px (`4, 8, 12, 16, 24, 32`).
- Border radius: `6px` tombol/badge, `8px` kartu, `12px` modal.
- Shadow: `0 1px 3px rgba(0,0,0,0.08)` untuk kartu.

## Komponen umum

### Tombol

- Primary: bg `--color-primary`, teks putih.
- Secondary: outline/border `--color-border`, teks `--color-text`.
- Danger: bg `--color-danger`, teks putih (untuk skip/hapus).
- Disabled: opacity `0.5`.

### Badge status

| Status   | Warna     |
| -------- | --------- |
| waiting  | `--color-warning` |
| skipped  | `--color-danger`  |
| called   | `--color-info`    |
| done     | `--color-success` |

Contoh:

```jsx
const STATUS_COLORS = {
  waiting: 'var(--color-warning)',
  skipped: 'var(--color-danger)',
  called: 'var(--color-info)',
  done: 'var(--color-success)',
};

function StatusBadge({ status }) {
  return (
    <span style={{ background: STATUS_COLORS[status], color: '#fff' }}>
      {status}
    </span>
  );
}
```

### Form

- Input: border `--color-border`, focus border `--color-primary`.
- Label: `--color-text-muted`, `text-sm`.
- Error: teks `--color-danger`, `text-sm`.

## Responsive

- Mobile-first; breakpoint `640px` (sm), `768px` (md), `1024px` (lg).
- Tabel bisa di-scroll horizontal di layar kecil (wrapper `overflow-x: auto`).
