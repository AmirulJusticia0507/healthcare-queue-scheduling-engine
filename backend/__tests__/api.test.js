const pool = require('../src/config/database');

describe('Database', () => {
  test('should connect to PostgreSQL', async () => {
    const res = await pool.query('SELECT NOW()');
    expect(res.rows).toHaveLength(1);
    expect(res.rows[0].now).toBeDefined();
  });

  test('should have required tables', async () => {
    const tables = await pool.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    const names = tables.rows.map(r => r.table_name);
    expect(names).toContain('patients');
    expect(names).toContain('doctors');
    expect(names).toContain('queue_entries');
    expect(names).toContain('users');
    expect(names).toContain('clinics');
    expect(names).toContain('appointments');
    expect(names).toContain('audit_logs');
    expect(names).toContain('notifications');
  });
});

describe('Auth Service', () => {
  const authService = require('../src/modules/auth/auth.service');

  test('verifyUser should return null for wrong password', async () => {
    const result = await authService.verifyUser('admin@health.id', 'wrongpassword');
    expect(result).toBeNull();
  });

  test('verifyUser should return token for correct credentials', async () => {
    const result = await authService.verifyUser('admin@health.id', 'admin123');
    expect(result).not.toBeNull();
    expect(result.token).toBeDefined();
    expect(result.user.email).toBe('admin@health.id');
    expect(result.user.role).toBe('admin');
  });

  test('getUserByEmail should return user', async () => {
    const user = await authService.getUserByEmail('admin@health.id');
    expect(user).not.toBeNull();
    expect(user.name).toBe('Admin');
  });
});

describe('Queue Service', () => {
  const queueService = require('../src/modules/queue/queue.service');

  test('clinicOf should return default clinic', () => {
    const clinicId = queueService.clinicOf({});
    expect(clinicId).toBe(queueService.DEFAULT_CLINIC);
  });

  test('clinicOf should use query param', () => {
    const clinicId = queueService.clinicOf({ query: { clinic: '5' }, body: {} });
    expect(clinicId).toBe(5);
  });
});

describe('Audit Service', () => {
  const auditService = require('../src/modules/audit/audit.service');

  test('log should not throw', async () => {
    await expect(auditService.log({
      userId: 1,
      action: 'TEST',
      entityType: 'test',
      entityId: 1,
      details: 'test log',
      ipAddress: '127.0.0.1',
    })).resolves.not.toThrow();
  });

  test('getAuditLogs should return paginated results', async () => {
    const result = await auditService.getAuditLogs({ page: 1, limit: 10 });
    expect(result).toHaveProperty('items');
    expect(result).toHaveProperty('total');
    expect(result).toHaveProperty('page', 1);
    expect(Array.isArray(result.items)).toBe(true);
  });
});

describe('Notification Service', () => {
  const notifService = require('../src/modules/notifications/notification.service');

  test('createNotification should return notification object', async () => {
    const notif = await notifService.createNotification(1, {
      title: 'Test',
      message: 'Test notification',
      type: 'info',
    });
    expect(notif).toHaveProperty('id');
    expect(notif.title).toBe('Test');

    // cleanup
    await notifService.deleteNotification(notif.id, 1);
  });
});

describe('Report Service', () => {
  const reportService = require('../src/modules/reports/report.service');

  test('getQueueStats should return stats object', async () => {
    const stats = await reportService.getQueueStats(1);
    expect(stats).toHaveProperty('today');
    expect(stats).toHaveProperty('doctors');
    expect(stats).toHaveProperty('daily');
    expect(stats).toHaveProperty('statusBreakdown');
    expect(typeof stats.today.waiting).toBe('number');
  });
});

describe('Patient Service', () => {
  const patientService = require('../src/modules/patients/patient.service');

  test('getAllPatients should return paginated results', async () => {
    const result = await patientService.getAllPatients({ page: 1, limit: 10 });
    expect(result).toHaveProperty('items');
    expect(result).toHaveProperty('total');
    expect(Array.isArray(result.items)).toBe(true);
  });
});

describe('Doctor Service', () => {
  const doctorService = require('../src/modules/doctors/doctor.service');

  test('getAllDoctors should return array', async () => {
    const doctors = await doctorService.getAllDoctors(1);
    expect(Array.isArray(doctors)).toBe(true);
  });
});
