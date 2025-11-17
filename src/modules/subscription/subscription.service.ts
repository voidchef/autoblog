import * as emailService from '../email/email.service';
import logger from '../logger/logger';
import User from '../user/user.model';

/**
 * Check and expire subscriptions that are past their expiry date
 * @returns {Promise<number>} Number of subscriptions expired
 */
export const expireSubscriptions = async (): Promise<number> => {
  try {
    const now = new Date();

    // Find all active subscriptions that have expired
    const result = await User.updateMany(
      {
        subscriptionStatus: 'active',
        subscriptionExpiresAt: { $lte: now },
      },
      {
        $set: {
          subscriptionStatus: 'expired',
          subscriptionPlan: 'free',
        },
      }
    );

    const expiredCount = result.modifiedCount || 0;
    if (expiredCount > 0) {
      logger.info(`Expired ${expiredCount} subscriptions`);
    }

    return expiredCount;
  } catch (error) {
    logger.error('Error expiring subscriptions:', error);
    throw error;
  }
};

/**
 * Send expiry warning emails to users whose subscriptions will expire in 7 days
 * @returns {Promise<number>} Number of warning emails sent
 */
export const sendExpiryWarnings = async (): Promise<number> => {
  try {
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    // Find users whose subscriptions expire in 7 days
    const users = await User.find({
      subscriptionStatus: 'active',
      subscriptionExpiresAt: {
        $gte: now,
        $lte: sevenDaysFromNow,
      },
    });

    let emailsSent = 0;

    for (const user of users) {
      try {
        if (user.subscriptionExpiresAt) {
          await emailService.sendSubscriptionExpiryWarning(
            user.email,
            user.name,
            user.subscriptionPlan || 'pro',
            user.subscriptionExpiresAt
          );
          emailsSent++;
        }
      } catch (emailError) {
        logger.error(`Failed to send expiry warning to ${user.email}:`, emailError);
      }
    }

    if (emailsSent > 0) {
      logger.info(`Sent ${emailsSent} subscription expiry warnings`);
    }

    return emailsSent;
  } catch (error) {
    logger.error('Error sending expiry warnings:', error);
    throw error;
  }
};

/**
 * Run daily subscription maintenance tasks
 * - Expire subscriptions
 * - Send expiry warnings
 * @returns {Promise<{ expired: number; warnings: number }>}
 */
export const runDailyMaintenance = async (): Promise<{ expired: number; warnings: number }> => {
  logger.info('Running daily subscription maintenance...');

  const expired = await expireSubscriptions();
  const warnings = await sendExpiryWarnings();

  logger.info(`Daily maintenance complete: ${expired} expired, ${warnings} warnings sent`);

  return { expired, warnings };
};
