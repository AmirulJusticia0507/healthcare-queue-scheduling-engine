# Healthcare Queue Scheduling Engine - Backend

Backend REST API untuk Healthcare Queue Scheduling Engine, dibangun dengan **Node.js + Express 5 + PostgreSQL**.

## Fitur

- CRUD dokter, pasien, janji temu, antrian
- User management (admin, staff, doctor) + role-based access
- CAPTCHA (Cap.js) di login
- Rate limiting (login 5/15min, API 120/min, per-user write 30/min)
- Email notifications (appointment confirmation, queue called)
- Patient self-registration (public endpoint)
- Audit trail (auto-logging semua write operations)
- Notifications CRUD
- Reports & analytics
- Webhooks (register, trigger on events)
- Shared auth/SSO + unified audit trail (integrasi DNA system)
- Patient merge/deduplicate
- Data export CSV + Excel
- Login history logging
- Health check endpoint
- Swagger/OpenAPI docs (`/api-docs`)
- Structured logging (Winston)
- Jest unit tests (13 passing)

## Prasyarat

- Node.js 18+
- PostgreSQL 14+ (atau via Docker/Podman)

## Setup

```bash
cd backend
npm install
```

### Database

Container PostgreSQL via Podman:

```bash
podman run -d --name healthcare-pg \
  -e POSTGRES_PASSWORD=change-me \
  -e POSTGRES_DB=healthcare_queue_db \
  -p 5434:5432 \
  postgres:18-alpine
```

Jalankan schema + migration + seed:

```bash
psql -h 127.0.0.1 -p 5434 -U postgres -d healthcare_queue_db -f db/schema.sql
node db/migrate.js
node db/seed.js
```

### Konfigurasi `.env`

```env
PORT=5000
DB_HOST=127.0.0.1
DB_USER=postgres
DB_PASSWORD=change-me
DB_NAME=healthcare_queue_db
DB_PORT=5434
JWT_SECRET=change-me-generate-a-long-random-secret
INTEGRATION_API_KEY=your-integration-api-key-here
CAPTCHA_API_ENDPOINT=https://spl.jogjaprov.go.id/captcha/79fb58190a/
CORS_ORIGINS=localhost:5173,localhost:5174,localhost:3000
```

### Database Connection (Beekeeper Studio / pgAdmin)

| Setting  | Value               |
|----------|---------------------|
| Host     | `127.0.0.1`         |
| Port     | `5434`              |
| User     | `postgres`          |
| Password | `change-me`          |
| Database | `healthcare_queue_db` |

> **WSL users:** Jika Beekeeper di Windows, pakai IP WSL (`172.x.x.x`) sebagai host.

## Menjalankan

```bash
npm run dev      # dengan nodemon (auto restart)
# atau
npm start        # production
```

Server berjalan di `http://localhost:5000`.

Health check: `GET /health`

## Demo Accounts

| Email                | Password    | Role   |
|----------------------|-------------|--------|
| admin@health.id      | admin123    | admin  |
| staff@health.id      | staff123    | staff  |
| dokter@health.id     | dokter123   | doctor |

## API

### Auth

| Method | Endpoint                    | Deskripsi              | Auth    |
|--------|-----------------------------|------------------------|---------|
| POST   | `/api/auth/login`           | Login (+ CAPTCHA)      | Public  |
| GET    | `/api/auth/me`              | Current user info      | Bearer  |
| PATCH  | `/api/auth/profile`         | Update profile         | Bearer  |
| POST   | `/api/auth/change-password` | Change password        | Bearer  |

### Users (admin only)

| Method | Endpoint                       | Deskripsi          |
|--------|--------------------------------|--------------------|
| GET    | `/api/auth/users`              | List all users     |
| GET    | `/api/auth/users/:id`          | Get user by ID     |
| POST   | `/api/auth/users`              | Create user        |
| PUT    | `/api/auth/users/:id`          | Update user        |
| POST   | `/api/auth/users/:id/reset-password` | Reset password |
| DELETE | `/api/auth/users/:id`          | Delete user        |
| GET    | `/api/auth/login-logs`         | Login history      |

### Doctors

| Method | Endpoint             | Deskripsi                                  |
|--------|----------------------|--------------------------------------------|
| GET    | `/api/doctors`       | Daftar dokter                              |
| POST   | `/api/doctors`       | Tambah dokter                              |
| PUT    | `/api/doctors/:id`   | Ubah dokter                                |
| DELETE | `/api/doctors/:id`   | Hapus dokter                               |

### Patients

| Method | Endpoint              | Deskripsi                    |
|--------|-----------------------|------------------------------|
| GET    | `/api/patients`       | List patients (search, paginate) |
| POST   | `/api/patients`       | Create patient               |
| PUT    | `/api/patients/:id`   | Update patient               |
| DELETE | `/api/patients/:id`   | Delete patient               |
| POST   | `/api/register`       | Self-registration (public)   |

### Queue

| Method | Endpoint                  | Deskripsi                  |
|--------|---------------------------|----------------------------|
| GET    | `/api/queue`              | Antrian + estimasi         |
| POST   | `/api/queue`              | Join antrian               |
| PATCH  | `/api/queue/:id/skip`     | Skip pasien                |
| PATCH  | `/api/queue/:id/recall`   | Recall pasien              |
| PATCH  | `/api/queue/:id/done`     | Tandai selesai             |

### Appointments

| Method | Endpoint                    | Deskripsi               |
|--------|-----------------------------|-------------------------|
| GET    | `/api/appointments`         | List appointments       |
| POST   | `/api/appointments`         | Create appointment      |
| PUT    | `/api/appointments/:id`     | Update appointment      |
| DELETE | `/api/appointments/:id`     | Delete appointment      |
| POST   | `/api/appointments/:id/confirm` | Confirm → queue     |

### Reports & Audit

| Method | Endpoint            | Deskripsi            |
|--------|---------------------|----------------------|
| GET    | `/api/reports/stats`| Dashboard stats      |
| GET    | `/api/audit`        | Audit trail logs     |
| GET    | `/api/notifications`| Notifications list   |

### Export

| Method | Endpoint              | Deskripsi       |
|--------|-----------------------|-----------------|
| GET    | `/api/queue/history`  | Queue history   |
| GET    | `/api/queue/history.xlsx` | Excel export |

### Integration (Service-to-Service)

| Method | Endpoint                        | Deskripsi           |
|--------|---------------------------------|---------------------|
| GET    | `/api/integration/patients`     | Proxy patients      |
| POST   | `/api/integration/patients`     | Proxy create patient|
| POST   | `/api/integration/clinical-notes`| Push clinical notes |
| GET    | `/api/integration/doctor-schedule/:id` | Doctor schedule |

> Semua integration endpoints require `X-API-Key` header.

### Webhooks

| Method | Endpoint              | Deskripsi       |
|--------|-----------------------|-----------------|
| GET    | `/api/webhooks`       | List webhooks   |
| POST   | `/api/webhooks`       | Register webhook|

### Swagger

`GET /api-docs` — OpenAPI 3.0 documentation.

## Struktur proyek

```
backend/
├── db/
│   ├── schema.sql           # Full DB schema
│   ├── migrate.js           # Alter tables + create new tables
│   └── seed.js              # Seed data (doctors, patients, users)
├── src/
│   ├── app.js               # Express app + all routes
│   ├── server.js            # Entry point
│   ├── config/
│   │   └── database.js      # PostgreSQL pool
│   ├── middleware/
│   │   ├── auth.js          # JWT verification
│   │   ├── role.js          # Role-based access
│   │   ├── rateLimit.js     # Rate limiting
│   │   ├── audit.js         # Auto audit logging
│   │   ├── logger.js        # Request logger
│   │   └── captcha.js       # CAPTCHA verification
│   ├── modules/
│   │   ├── auth/            # Login, users, profile
│   │   ├── doctors/         # Doctor CRUD
│   │   ├── patients/        # Patient CRUD + merge
│   │   ├── queue/           # Queue management
│   │   ├── appointments/    # Appointment scheduling
│   │   ├── reports/         # Analytics & reports
│   │   ├── audit/           # Audit trail
│   │   ├── notifications/   # Notifications
│   │   └── webhooks/        # Webhook management
│   └── utils/
│       ├── email.js         # Nodemailer
│       ├── logger.js        # Winston
│       ├── sso.js           # Shared auth
│       ├── unifiedAudit.js  # Cross-system audit
│       └── dataRetention.js # Auto-archive
├── scripts/
│   └── backup.sh            # DB backup script
├── __tests__/
│   └── api.test.js          # Jest tests
├── config/
│   └── swagger.js           # OpenAPI spec
├── .env
└── package.json
```

## Testing

```bash
npx jest --forceExit
```

## Backup

```bash
bash scripts/backup.sh
```

Backups stored in `backups/` directory (excluded from git).
