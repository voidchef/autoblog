import { Job } from 'bullmq';
import * as emailService from '../../email/email.service';
import logger from '../../logger/logger';
import { EmailJobData } from '../queue.interfaces';

/**
 * Process email job
 */
export async function processEmailJob(job: Job<EmailJobData>): Promise<void> {
  const { to, subject, text, html } = job.data;

  try {
    logger.info(`Sending email to: ${to}`);
    await emailService.sendEmail(to, subject, text, html);
    logger.info(`Email sent successfully to: ${to}`);
  } catch (error) {
    logger.error(`Error sending email to ${to}:`, error);
    throw error; // Re-throw to mark job as failed
  }
}
