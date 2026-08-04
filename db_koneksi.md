# Database Connection - Healthcare Queue Scheduling Engine

## PostgreSQL (Local Dev)

| Field    | Value              |
|----------|--------------------|
| Host     | `127.0.0.1`       |
| Port     | `5433`             |
| Database | `healthcare_queue_db` |
| User     | `postgres`         |
| Password | _(trust - kosong)_ |
| Engine   | PostgreSQL 18      |

### Beekeeper Studio Setup

1. Buka Beekeeper Studio
2. Klik **New Connection**
3. Pilih **PostgreSQL**
4. Isi:
   - Host: `127.0.0.1`
   - Port: `5433`
   - Database: `healthcare_queue_db`
   - User: `postgres`
   - Password: _(kosongkan)_
5. Klik **Test Connection** lalu **Save**

### Tables

| Table         | Fungsi                           |
|---------------|----------------------------------|
| `users`       | Auth (admin/staff login)         |
| `clinics`     | Data klinik                      |
| `doctors`     | Data dokter + jadwal             |
| `queue_entries` | Antrian pasien (status, notes, external_id) |

### User Login

| Email            | Password   | Role  |
|------------------|------------|-------|
| admin@health.id  | admin123   | admin |
| staff@health.id  | staff123   | staff |

---

## Docker (Production / CI)

Saat pakai Docker Compose, PostgreSQL jalan di internal network:

| Field    | Value                   |
|----------|-------------------------|
| Host     | `db` (service name)     |
| Port     | `5432`                  |
| User     | `postgres`              |
| Password | `postgres`              |

Tidak perlu diakses langsung dari Beekeeper. Pakai port mapping di `docker-compose.yml` jika perlu.
