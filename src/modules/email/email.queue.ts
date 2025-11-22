import logger from '../logger/logger';
import { queueService, QueueName } from '../queue';
import * as emailService from './email.service';

/**
 * Send email through queue if available, otherwise send directly
 */
export async function sendEmailQueued(to: string, subject: string, text: string, html: string): Promise<void> {
  if (queueService.isAvailable()) {
    try {
      await queueService.addJob(QueueName.EMAIL, {
        to,
        subject,
        text,
        html,
        timestamp: Date.now(),
      });
      logger.info(`Email queued for: ${to}`);
    } catch (error) {
      logger.warn('Failed to queue email, sending directly:', error);
      await emailService.sendEmail(to, subject, text, html);
    }
  } else {
    // Queue not available (in-memory mode), send directly
    await emailService.sendEmail(to, subject, text, html);
  }
}

/**
 * Send reset password email (queued if available)
 */
export async function sendResetPasswordEmailQueued(to: string, token: string): Promise<void> {
  if (queueService.isAvailable()) {
    try {
      // Generate email content
      const subject = 'Reset password';
      const resetPasswordUrl = `${(await import('../../config/config')).default.clientUrl}/reset-password?token=${token}`;
      const text = `Hi,
To reset your password, click on this link: ${resetPasswordUrl}
If you did not request any password resets, then ignore this email.`;
      const html = `<div style="margin:30px; padding:30px; border:1px solid black; border-radius: 20px 10px;"><h4><strong>Dear user,</strong></h4>
  <p>To reset your password, click on this link: ${resetPasswordUrl}</p>
  <p>If you did not request any password resets, please ignore this email.</p>
  <p>Thanks,</p>
  <p><strong>Team</strong></p></div>`;

      await sendEmailQueued(to, subject, text, html);
    } catch (error) {
      logger.error('Failed to queue reset password email:', error);
      // Fallback to direct send
      await emailService.sendResetPasswordEmail(to, token);
    }
  } else {
    await emailService.sendResetPasswordEmail(to, token);
  }
}

/**
 * Send verification email (queued if available)
 */
export async function sendVerificationEmailQueued(to: string, token: string, name: string): Promise<void> {
  if (queueService.isAvailable()) {
    try {
      const config = (await import('../../config/config')).default;
      const subject = 'Email Verification';
      const verificationEmailUrl = `${config.clientUrl}/verify-email?token=${token}`;
      const text = `Hi ${name},
To verify your email, click on this link: ${verificationEmailUrl}
If you did not create an account, then ignore this email.`;
      const html = `<div style="margin:30px; padding:30px; border:1px solid black; border-radius: 20px 10px;"><h4><strong>Hi ${name},</strong></h4>
  <p>To verify your email, click on this link: ${verificationEmailUrl}</p>
  <p>If you did not create an account, then ignore this email.</p></div>`;

      await sendEmailQueued(to, subject, text, html);
    } catch (error) {
      logger.error('Failed to queue verification email:', error);
      await emailService.sendVerificationEmail(to, token, name);
    }
  } else {
    await emailService.sendVerificationEmail(to, token, name);
  }
}

/**
 * Send successful registration email (queued if available)
 */
export async function sendSuccessfulRegistrationQueued(to: string, token: string, name: string): Promise<void> {
  if (queueService.isAvailable()) {
    try {
      const config = (await import('../../config/config')).default;
      const subject = 'Email Verification';
      const verificationEmailUrl = `${config.clientUrl}/verify-email?token=${token}`;
      const text = `Hi ${name},
Congratulations! Your account has been created. 
You are almost there. Complete the final step by verifying your email at: ${verificationEmailUrl}
Don't hesitate to contact us if you face any problems
Regards,
Team`;
      const html = `<div style="margin:30px; padding:30px; border:1px solid black; border-radius: 20px 10px;"><h4><strong>Hi ${name},</strong></h4>
  <p>Congratulations! Your account has been created.</p>
  <p>You are almost there. Complete the final step by verifying your email at: ${verificationEmailUrl}</p>
  <p>Don't hesitate to contact us if you face any problems</p>
  <p>Regards,</p>
  <p><strong>Team</strong></p></div>`;

      await sendEmailQueued(to, subject, text, html);
    } catch (error) {
      logger.error('Failed to queue registration email:', error);
      await emailService.sendSuccessfulRegistration(to, token, name);
    }
  } else {
    await emailService.sendSuccessfulRegistration(to, token, name);
  }
}

/**
 * Send payment success email (queued if available)
 */
export async function sendPaymentSuccessEmailQueued(
  to: string,
  name: string,
  plan: string,
  amount: number,
  paymentId: string,
  expiresAt: Date
): Promise<void> {
  if (queueService.isAvailable()) {
    try {
      const subject = 'Payment Successful - Subscription Activated';
      const expiryDate = expiresAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const text = `Hi ${name},
Your payment has been processed successfully and your ${plan.toUpperCase()} subscription is now active!

Payment Details:
- Amount Paid: ₹${amount}
- Plan: ${plan.toUpperCase()}
- Payment ID: ${paymentId}
- Subscription Valid Until: ${expiryDate}

You can now enjoy all the premium features of your ${plan.toUpperCase()} plan.
If you have any questions, please don't hesitate to contact us.

Regards,
Team`;
      const html = `<div style="margin:30px; padding:30px; border:1px solid #4CAF50; border-radius: 10px; font-family: Arial, sans-serif;">
    <h2 style="color: #4CAF50;">Payment Successful! 🎉</h2>
    <h4><strong>Hi ${name},</strong></h4>
    <p>Your payment has been processed successfully and your <strong>${plan.toUpperCase()}</strong> subscription is now active!</p>
    
    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
      <h3 style="margin-top: 0;">Payment Details</h3>
      <p><strong>Amount Paid:</strong> ₹${amount}</p>
      <p><strong>Plan:</strong> ${plan.toUpperCase()}</p>
      <p><strong>Payment ID:</strong> ${paymentId}</p>
      <p><strong>Subscription Valid Until:</strong> ${expiryDate}</p>
    </div>
    
    <p>You can now enjoy all the premium features of your ${plan.toUpperCase()} plan.</p>
    <p>If you have any questions, please don't hesitate to contact us.</p>
    <p>Regards,</p>
    <p><strong>Team</strong></p>
  </div>`;

      await sendEmailQueued(to, subject, text, html);
    } catch (error) {
      logger.error('Failed to queue payment success email:', error);
      await emailService.sendPaymentSuccessEmail(to, name, plan, amount, paymentId, expiresAt);
    }
  } else {
    await emailService.sendPaymentSuccessEmail(to, name, plan, amount, paymentId, expiresAt);
  }
}

/**
 * Send newsletter welcome email (queued if available)
 */
export async function sendNewsletterWelcomeEmailQueued(to: string): Promise<void> {
  if (queueService.isAvailable()) {
    try {
      const config = (await import('../../config/config')).default;
      const subject = 'Welcome to Our Newsletter! 📰';
      const unsubscribeUrl = `${config.clientUrl}/newsletter/unsubscribe?email=${encodeURIComponent(to)}`;
      const text = `Hi there,
  
Thank you for subscribing to our newsletter!

You'll now receive the latest updates, articles, and news delivered directly to your inbox.

We promise to keep our content valuable and relevant. You can unsubscribe at any time by clicking the link below.

Unsubscribe: ${unsubscribeUrl}

Regards,
Autoblog Team`;
      const html = `<div style="margin:30px; padding:30px; border:1px solid #4CAF50; border-radius: 10px; font-family: Arial, sans-serif;">
    <h2 style="color: #4CAF50;">Welcome to Our Newsletter! 📰</h2>
    <h4><strong>Hi there,</strong></h4>
    <p>Thank you for subscribing to our newsletter!</p>
    
    <p>You'll now receive the latest updates, articles, and news delivered directly to your inbox.</p>
    
    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
      <h3 style="margin-top: 0;">What to Expect</h3>
      <ul>
        <li>Latest blog posts and articles</li>
        <li>Exclusive content and updates</li>
        <li>News and announcements</li>
      </ul>
    </div>
    
    <p>We promise to keep our content valuable and relevant. You can unsubscribe at any time.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${unsubscribeUrl}" style="color: #666; text-decoration: underline; font-size: 0.9em;">Unsubscribe</a>
    </div>
    
    <p>Regards,</p>
    <p><strong>Autoblog Team</strong></p>
  </div>`;

      await sendEmailQueued(to, subject, text, html);
    } catch (error) {
      logger.error('Failed to queue newsletter welcome email:', error);
      await emailService.sendNewsletterWelcomeEmail(to);
    }
  } else {
    await emailService.sendNewsletterWelcomeEmail(to);
  }
}
