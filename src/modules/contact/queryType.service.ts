import { IQueryTypeDoc, NewQueryType } from './queryType.interfaces';
import QueryType from './queryType.model';

/**
 * Create a query type
 * @param {NewQueryType} queryTypeBody
 * @returns {Promise<IQueryTypeDoc>}
 */
export const createQueryType = async (queryTypeBody: NewQueryType): Promise<IQueryTypeDoc> => {
  return QueryType.create(queryTypeBody);
};

/**
 * Get all active query types ordered by order field
 * @returns {Promise<IQueryTypeDoc[]>}
 */
export const getActiveQueryTypes = async (): Promise<IQueryTypeDoc[]> => {
  return QueryType.find({ isActive: true }).sort({ order: 1 }).exec();
};

/**
 * Get all query types
 * @returns {Promise<IQueryTypeDoc[]>}
 */
export const getAllQueryTypes = async (): Promise<IQueryTypeDoc[]> => {
  return QueryType.find().sort({ order: 1 }).exec();
};
