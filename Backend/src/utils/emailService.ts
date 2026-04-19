import nodemailer from 'nodemailer';
import Queue from 'bull';
import { MAIL_ADDRESS, MAIL_PASSWORD, REDIS_URL } from '../config/index.js';
import logger from './logger.js';
import prisma from '../lib/prisma.js';

interface EmailData {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    path: string;
  }>;
}

// Create email queue and dead-letter queue
const emailQueue = new Queue('email-queue', REDIS_URL);
const emailDLQ = new Queue('email-dlq', REDIS_URL);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: MAIL_ADDRESS,
    pass: MAIL_PASSWORD,
  },
});

export const sendEmail = async (data: EmailData): Promise<void> => {
  // Add email to queue
  await emailQueue.add(data, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  });
};

// Process email queue
emailQueue.process(async (job) => {
  const { to, subject, html, attachments } = job.data;

  try {
    const info = await transporter.sendMail({
      from: MAIL_ADDRESS,
      to,
      subject,
      html,
      attachments,
    });

    logger.info(`Email sent: ${info.messageId}`);
    await trackEmailDelivery(to, subject, 'delivered');
  } catch (error) {
    logger.error(`Error sending email (Job ${job.id}):`, error);
    await trackEmailDelivery(to, subject, 'failed');
    throw error;
  }
});

// Handle failed jobs and move to DLQ
emailQueue.on('failed', async (job, error) => {
  if (job.attemptsMade >= (job.opts.attempts || 1)) {
    logger.error(
      `Job ${job.id} definitively failed. Moving to DLQ. Error: ${error.message}`
    );
    await emailDLQ.add({
      originalJobId: job.id,
      data: job.data,
      error: error.message,
      failedAt: new Date(),
    });
  } else {
    logger.warn(
      `Job ${job.id} failed (${job.attemptsMade} attempts). Retrying... Error: ${error.message}`
    );
  }
});

// Process DLQ (just for logging/alerting — manual intervention required)
emailDLQ.process(async (job) => {
  logger.error(
    'CRITICAL: Email in Dead-Letter Queue requires review:',
    job.data
  );
  // Optional: Send alert to admin
});

// Track email delivery status
const trackEmailDelivery = async (
  to: string,
  subject: string,
  status: 'delivered' | 'failed'
) => {
  try {
    await prisma.emailLog.create({
      data: {
        recipient: to,
        subject,
        status,
        sent_at: new Date(),
      },
    });
  } catch (error) {
    logger.error('Error tracking email delivery:', error);
  }
};

export const sendVerificationEmail = async (
  to: string,
  token: string
): Promise<void> => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const mailOptions: EmailData = {
    to,
    subject: 'Verify your email address',
    html: `
      <h1>Email Verification</h1>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
    `,
  };

  await sendEmail(mailOptions);
};
