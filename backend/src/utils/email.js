const nodemailer = require('nodemailer');
const logger = require('../../utils/logger');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

async function sendEmail({ to, subject, html }) {
  if (!process.env.SMTP_USER) {
    logger.info('Email skipped (no SMTP configured)', { to, subject });
    return { sent: false, reason: 'no_smtp' };
  }
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || 'Healthcare Queue <noreply@health.id>',
      to,
      subject,
      html,
    });
    logger.info('Email sent', { to, subject, messageId: info.messageId });
    return { sent: true, messageId: info.messageId };
  } catch (err) {
    logger.error('Email failed', { to, subject, error: err.message });
    return { sent: false, reason: err.message };
  }
}

async function sendAppointmentConfirmation(patientEmail, patientName, doctorName, date, time) {
  return sendEmail({
    to: patientEmail,
    subject: 'Konfirmasi Janji Temu - Healthcare Queue',
    html: `
      <h2>Janji Temu Dikonfirmasi</h2>
      <p>Halo ${patientName},</p>
      <p>Janji temu Anda telah dikonfirmasi:</p>
      <ul>
        <li><strong>Dokter:</strong> ${doctorName}</li>
        <li><strong>Tanggal:</strong> ${date}</li>
        <li><strong>Jam:</strong> ${time}</li>
      </ul>
      <p>Silakan datang 15 menit sebelum jadwal.</p>
      <p>Terima kasih,<br>Healthcare Queue System</p>
    `,
  });
}

async function sendQueueCalled(patientEmail, patientName, queueNumber, doctorName) {
  return sendEmail({
    to: patientEmail,
    subject: 'Anda Dipanggil - Healthcare Queue',
    html: `
      <h2>Panggilan Antrian</h2>
      <p>Halo ${patientName},</p>
      <p>Anda telah dipanggil untuk dilayani:</p>
      <ul>
        <li><strong>Nomor Antrian:</strong> #${queueNumber}</li>
        <li><strong>Dokter:</strong> ${doctorName}</li>
      </ul>
      <p>Silakan menuju ruang konsultasi.</p>
    `,
  });
}

module.exports = { sendEmail, sendAppointmentConfirmation, sendQueueCalled };
