import httpStatus from 'http-status';
import ApiError from '../errors/ApiError';
import { IOptions, QueryResult } from '../paginate/paginate';
import { INewsletterDoc } from './newsletter.interfaces';
import Newsletter from './newsletter.model';

/**
 * Subscribe to newsletter
 * @param {string} email
 * @returns {Promise<INewsletterDoc>}
 */
export const subscribe = async (email: string): Promise<INewsletterDoc> => {
  const existingSubscriber = await Newsletter.findOne({ email });

  if (existingSubscriber) {
    if (existingSubscriber.isActive) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Email is already subscribed to newsletter');
    }
    // Reactivate subscription
    existingSubscriber.isActive = true;
    existingSubscriber.subscribedAt = new Date();
    existingSubscriber.set('unsubscribedAt', undefined);
    await existingSubscriber.save();
    return existingSubscriber;
  }

  const subscriber = await Newsletter.create({ email });
  return subscriber;
};

/**
 * Unsubscribe from newsletter
 * @param {string} email
 * @returns {Promise<INewsletterDoc>}
 */
export const unsubscribe = async (email: string): Promise<INewsletterDoc> => {
  const subscriber = await Newsletter.findOne({ email });

  if (!subscriber) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Email not found in newsletter subscribers');
  }

  if (!subscriber.isActive) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email is already unsubscribed');
  }

  subscriber.isActive = false;
  subscriber.unsubscribedAt = new Date();
  await subscriber.save();

  return subscriber;
};

/**
 * Query for subscribers
 * @param {Object} filter - Mongo filter
 * @param {IOptions} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
export const querySubscribers = async (filter: Record<string, unknown>, options: IOptions): Promise<QueryResult> => {
  const subscribers = await Newsletter.paginate(filter, options);
  return subscribers;
};

/**
 * Get subscriber by email
 * @param {string} email
 * @returns {Promise<INewsletterDoc | null>}
 */
export const getSubscriberByEmail = async (email: string): Promise<INewsletterDoc | null> => {
  return Newsletter.findOne({ email });
};

/**
 * Get active subscribers count
 * @returns {Promise<number>}
 */
export const getActiveSubscribersCount = async (): Promise<number> => {
  return Newsletter.countDocuments({ isActive: true });
};
