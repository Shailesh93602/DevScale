import nodemailer from 'nodemailer';
import Queue from 'bull';
import { MAIL_ADDRESS, MAIL_PASSWORD, REDIS_URL } from '../config';
import logger from './logger';
import prisma from '../lib/prisma';

interface EmailData {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    path: string;
  }>;
}

// Create email queue
const emailQueue = new Queue('email-queue', REDIS_URL);

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
    logger.error('Error sending email:', error);
    await trackEmailDelivery(to, subject, 'failed');
    throw error;
  }
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

// Handle failed jobs
emailQueue.on('failed', (job, error) => {
  logger.error(`Job ${job.id} failed:`, error);
});

export const sendVerificationEmail = async (
  to: string,
  token: string
): Promise<void> => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: MAIL_ADDRESS,
    to,
    subject: 'Verify your email address',
    html: `
      <h1>Email Verification</h1>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Verification email sent to ${to}`);
  } catch (error) {
    logger.error('Error sending verification email:', error);
    throw error;
  }
};
