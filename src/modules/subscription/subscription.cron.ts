import cron from 'node-cron';
import logger from '../logger/logger';
import * as subscriptionService from './subscription.service';

/**
 * Initialize subscription cron jobs
 */
export const initSubscriptionCronJobs = (): void => {
  // Run daily at 2:00 AM
  cron.schedule('0 2 * * *', async () => {
    try {
      logger.info('Starting scheduled subscription maintenance...');
      await subscriptionService.runDailyMaintenance();
    } catch (error) {
      logger.error('Error in subscription cron job:', error);
    }
  });

  logger.info('Subscription cron jobs initialized');
};
