import httpStatus from 'http-status';
import mongoose from 'mongoose';
import ApiError from '../errors/ApiError';
import { IOptions, QueryResult } from '../paginate/paginate';
import { IContactDoc, NewContact } from './contact.interfaces';
import Contact from './contact.model';

/**
 * Create a contact message
 * @param {NewContact} contactBody
 * @returns {Promise<IContactDoc>}
 */
export const createContact = async (contactBody: NewContact): Promise<IContactDoc> => {
  return Contact.create(contactBody);
};

/**
 * Query for contacts
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
export const queryContacts = async (filter: Record<string, any>, options: IOptions): Promise<QueryResult> => {
  const contacts = await Contact.paginate(filter, options);
  return contacts;
};

/**
 * Get contact by id
 * @param {mongoose.Types.ObjectId} id
 * @returns {Promise<IContactDoc | null>}
 */
export const getContactById = async (id: mongoose.Types.ObjectId): Promise<IContactDoc | null> => {
  return Contact.findById(id);
};

/**
 * Update contact by id
 * @param {mongoose.Types.ObjectId} contactId
 * @param {Partial<IContactDoc>} updateBody
 * @returns {Promise<IContactDoc | null>}
 */
export const updateContactById = async (
  contactId: mongoose.Types.ObjectId,
  updateBody: Partial<IContactDoc>
): Promise<IContactDoc | null> => {
  const contact = await getContactById(contactId);
  if (!contact) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Contact not found');
  }
  Object.assign(contact, updateBody);
  await contact.save();
  return contact;
};

/**
 * Delete contact by id
 * @param {mongoose.Types.ObjectId} contactId
 * @returns {Promise<IContactDoc | null>}
 */
export const deleteContactById = async (contactId: mongoose.Types.ObjectId): Promise<IContactDoc | null> => {
  const contact = await getContactById(contactId);
  if (!contact) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Contact not found');
  }
  await contact.deleteOne();
  return contact;
};
