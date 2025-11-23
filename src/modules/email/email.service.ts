import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import config from '../../config/config';
import logger from '../logger/logger';
import { queueService, QueueName } from '../queue';
import { Message } from './email.interfaces';

let _transport: Transporter | null = null;

export const getTransport = (): Transporter => {
  if (!_transport) {
    _transport = nodemailer.createTransport(config.email.smtp);
    /* istanbul ignore next */
    if (config.env !== 'test') {
      _transport
        .verify()
        .then(() => logger.info('Connected to email server'))
        .catch(() =>
          logger.warn('Unable to connect to email server. Make sure you have configured the SMTP options in .env')
        );
    }
  }
  return _transport;
};

// For backward compatibility
export const transport = getTransport();

// For testing - allow setting a custom transport
export const setTransport = (newTransport: Transporter): void => {
  _transport = newTransport;
};

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @param {string} html
 * @returns {Promise<void>}
 */
export const sendEmail = async (to: string, subject: string, text: string, html: string): Promise<void> => {
  const msg: Message = {
    from: config.email.from,
    to,
    subject,
    text,
    html,
  };
  await getTransport().sendMail(msg);
};

/**
 * Send reset password email through queue
 * @param {string} to
 * @param {string} token
 * @returns {Promise<void>}
 */
export const sendResetPasswordEmail = async (to: string, token: string): Promise<void> => {
  const subject = 'Reset password';
  const resetPasswordUrl = `${config.clientUrl}/reset-password?token=${token}`;
  const text = `Hi,
To reset your password, click on this link: ${resetPasswordUrl}
If you did not request any password resets, then ignore this email.`;
  const html = `<div style="margin:30px; padding:30px; border:1px solid black; border-radius: 20px 10px;"><h4><strong>Dear user,</strong></h4>
  <p>To reset your password, click on this link: ${resetPasswordUrl}</p>
  <p>If you did not request any password resets, please ignore this email.</p>
  <p>Thanks,</p>
  <p><strong>Team</strong></p></div>`;

  await queueService.addJob(QueueName.EMAIL, { to, subject, text, html, timestamp: Date.now() });
  logger.info(`Reset password email queued for: ${to}`);
};

/**
 * Send verification email through queue
 * @param {string} to
 * @param {string} token
 * @param {string} name
 * @returns {Promise<void>}
 */
export const sendVerificationEmail = async (to: string, token: string, name: string): Promise<void> => {
  const subject = 'Email Verification';
  const verificationEmailUrl = `${config.clientUrl}/verify-email?token=${token}`;
  const text = `Hi ${name},
To verify your email, click on this link: ${verificationEmailUrl}
If you did not create an account, then ignore this email.`;
  const html = `<div style="margin:30px; padding:30px; border:1px solid black; border-radius: 20px 10px;"><h4><strong>Hi ${name},</strong></h4>
  <p>To verify your email, click on this link: ${verificationEmailUrl}</p>
  <p>If you did not create an account, then ignore this email.</p></div>`;

  await queueService.addJob(QueueName.EMAIL, { to, subject, text, html, timestamp: Date.now() });
  logger.info(`Verification email queued for: ${to}`);
};

/**
 * Send email verification after registration through queue
 * @param {string} to
 * @param {string} token
 * @param {string} name
 * @returns {Promise<void>}
 */
export const sendSuccessfulRegistration = async (to: string, token: string, name: string): Promise<void> => {
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

  await queueService.addJob(QueueName.EMAIL, { to, subject, text, html, timestamp: Date.now() });
  logger.info(`Registration email queued for: ${to}`);
};

/**
 * Send account created notification through queue
 * @param {string} to
 * @param {string} name
 * @returns {Promise<void>}
 */
export const sendAccountCreated = async (to: string, name: string): Promise<void> => {
  const subject = 'Account Created Successfully';
  const loginUrl = `${config.clientUrl}/auth/login`;
  const text = `Hi ${name},
Congratulations! Your account has been created successfully. 
You can now login at: ${loginUrl}
Don't hesitate to contact us if you face any problems
Regards,
Team`;
  const html = `<div style="margin:30px; padding:30px; border:1px solid black; border-radius: 20px 10px;"><h4><strong>Hi ${name},</strong></h4>
  <p>Congratulations! Your account has been created successfully.</p>
  <p>You can now login at: ${loginUrl}</p>
  <p>Don't hesitate to contact us if you face any problems</p>
  <p>Regards,</p>
  <p><strong>Team</strong></p></div>`;

  await queueService.addJob(QueueName.EMAIL, { to, subject, text, html, timestamp: Date.now() });
  logger.info(`Account created email queued for: ${to}`);
};

/**
 * Send payment success email
 * @param {string} to
 * @param {string} name
 * @param {string} plan
 * @param {number} amount
 * @param {string} paymentId
 * @param {Date} expiresAt
 * @returns {Promise<void>}
 */
export const sendPaymentSuccessEmail = async (
  to: string,
  name: string,
  plan: string,
  amount: number,
  paymentId: string,
  expiresAt: Date
): Promise<void> => {
  const subject = 'Payment Successful - Subscription Activated';
  const expiryDate = expiresAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const text = `Hi ${name},
  Thank you for your payment! Your ${plan.toUpperCase()} subscription has been activated successfully.
  
  Payment Details:
  - Amount Paid: ₹${amount}
  - Plan: ${plan.toUpperCase()}
  - Payment ID: ${paymentId}
  - Subscription Valid Until: ${expiryDate}
  
  You can now enjoy all the premium features of your ${plan.toUpperCase()} plan.
  
  If you have any questions, please don't hesitate to contact us.
  
  Regards,
  Team`;
  const html = `<div style="margin:30px; padding:30px; border:1px solid #e0e0e0; border-radius: 10px; font-family: Arial, sans-serif;">
    <h2 style="color: #4CAF50;">Payment Successful! 🎉</h2>
    <h4><strong>Hi ${name},</strong></h4>
    <p>Thank you for your payment! Your <strong>${plan.toUpperCase()}</strong> subscription has been activated successfully.</p>
    
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

  await queueService.addJob(QueueName.EMAIL, { to, subject, text, html, timestamp: Date.now() });
  logger.info(`Payment success email queued for: ${to}`);
};

/**
 * Send subscription expiry warning email
 * @param {string} to
 * @param {string} name
 * @param {string} plan
 * @param {Date} expiresAt
 * @returns {Promise<void>}
 */
export const sendSubscriptionExpiryWarning = async (
  to: string,
  name: string,
  plan: string,
  expiresAt: Date
): Promise<void> => {
  const subject = 'Subscription Expiring Soon';
  const expiryDate = expiresAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const renewUrl = `${config.clientUrl}/pricing`;
  const text = `Hi ${name},
  Your ${plan.toUpperCase()} subscription will expire on ${expiryDate}.
  
  To continue enjoying premium features, please renew your subscription before it expires.
  
  Renew now at: ${renewUrl}
  
  If you have any questions, please contact us.
  
  Regards,
  Team`;
  const html = `<div style="margin:30px; padding:30px; border:1px solid #ff9800; border-radius: 10px; font-family: Arial, sans-serif;">
    <h2 style="color: #ff9800;">Subscription Expiring Soon ⚠️</h2>
    <h4><strong>Hi ${name},</strong></h4>
    <p>Your <strong>${plan.toUpperCase()}</strong> subscription will expire on <strong>${expiryDate}</strong>.</p>
    
    <p>To continue enjoying premium features, please renew your subscription before it expires.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${renewUrl}" style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Renew Now</a>
    </div>
    
    <p>If you have any questions, please contact us.</p>
    <p>Regards,</p>
    <p><strong>Team</strong></p>
  </div>`;

  await queueService.addJob(QueueName.EMAIL, { to, subject, text, html, timestamp: Date.now() });
  logger.info(`Subscription expiry warning email queued for: ${to}`);
};

/**
 * Send newsletter welcome email
 * @param {string} to
 * @returns {Promise<void>}
 */
export const sendNewsletterWelcomeEmail = async (to: string): Promise<void> => {
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

  await queueService.addJob(QueueName.EMAIL, { to, subject, text, html, timestamp: Date.now() });
  logger.info(`Newsletter welcome email queued for: ${to}`);
};

/**
 * Send refund confirmation email
 * @param {string} to
 * @param {string} name
 * @param {number} amount
 * @param {string} refundId
 * @returns {Promise<void>}
 */
export const sendRefundConfirmationEmail = async (
  to: string,
  name: string,
  amount: number,
  refundId: string
): Promise<void> => {
  const subject = 'Refund Processed Successfully';
  const text = `Hi ${name},
  Your refund has been processed successfully.
  
  Refund Details:
  - Amount Refunded: ₹${amount}
  - Refund ID: ${refundId}
  
  The refund amount will be credited to your original payment method within 5-7 business days.
  
  If you have any questions, please contact us.
  
  Regards,
  Team`;
  const html = `<div style="margin:30px; padding:30px; border:1px solid #2196F3; border-radius: 10px; font-family: Arial, sans-serif;">
    <h2 style="color: #2196F3;">Refund Processed Successfully</h2>
    <h4><strong>Hi ${name},</strong></h4>
    <p>Your refund has been processed successfully.</p>
    
    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
      <h3 style="margin-top: 0;">Refund Details</h3>
      <p><strong>Amount Refunded:</strong> ₹${amount}</p>
      <p><strong>Refund ID:</strong> ${refundId}</p>
    </div>
    
    <p>The refund amount will be credited to your original payment method within 5-7 business days.</p>
    <p>If you have any questions, please contact us.</p>
    <p>Regards,</p>
    <p><strong>Team</strong></p>
  </div>`;

  await queueService.addJob(QueueName.EMAIL, { to, subject, text, html, timestamp: Date.now() });
  logger.info(`Refund confirmation email queued for: ${to}`);
};
