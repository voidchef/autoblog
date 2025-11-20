import { cacheService } from '../cache';
import { IQueryTypeDoc, NewQueryType } from './queryType.interfaces';
import QueryType from './queryType.model';

/**
 * Create a query type
 * @param {NewQueryType} queryTypeBody
 * @returns {Promise<IQueryTypeDoc>}
 */
export const createQueryType = async (queryTypeBody: NewQueryType): Promise<IQueryTypeDoc> => {
  const queryType = await QueryType.create(queryTypeBody);

  // Invalidate query types cache
  await cacheService.del('queryTypes:active');
  await cacheService.del('queryTypes:all');

  return queryType;
};

/**
 * Get all active query types ordered by order field
 * @returns {Promise<IQueryTypeDoc[]>}
 */
export const getActiveQueryTypes = async (): Promise<IQueryTypeDoc[]> => {
  const cacheKey = 'queryTypes:active';

  // Try to get from cache
  const cached = await cacheService.get<IQueryTypeDoc[]>(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch from database
  const queryTypes = await QueryType.find({ isActive: true }).sort({ order: 1 }).exec();

  // Cache the result (1 hour TTL - query types rarely change)
  await cacheService.set(cacheKey, queryTypes, 3600);

  return queryTypes;
};

/**
 * Get all query types
 * @returns {Promise<IQueryTypeDoc[]>}
 */
export const getAllQueryTypes = async (): Promise<IQueryTypeDoc[]> => {
  const cacheKey = 'queryTypes:all';

  // Try to get from cache
  const cached = await cacheService.get<IQueryTypeDoc[]>(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch from database
  const queryTypes = await QueryType.find().sort({ order: 1 }).exec();

  // Cache the result (1 hour TTL - query types rarely change)
  await cacheService.set(cacheKey, queryTypes, 3600);

  return queryTypes;
};
