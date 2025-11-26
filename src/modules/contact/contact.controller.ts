import { Request, Response } from 'express';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import { emailService } from '../email';
import ApiError from '../errors/ApiError';
import catchAsync from '../utils/catchAsync';
import pick from '../utils/pick';
import * as contactService from './contact.service';

export const createContact = catchAsync(async (req: Request, res: Response) => {
  const contact = await contactService.createContact(req.body);

  // Send confirmation email to user
  try {
    const subject = 'We received your message';
    const text = `Hi ${contact.name},\n\nThank you for contacting us. We have received your message regarding "${contact.queryType}".\n\nWe will get back to you within 24 hours.\n\nBest regards,\nAutoblog Team`;
    const html = `
      <div style="margin:30px; padding:30px; border:1px solid #e0e0e0; border-radius: 10px;">
        <h4><strong>Hi ${contact.name},</strong></h4>
        <p>Thank you for contacting us. We have received your message regarding <strong>"${contact.queryType}"</strong>.</p>
        <p>We will get back to you within 24 hours.</p>
        <p>Best regards,</p>
        <p><strong>Autoblog Team</strong></p>
      </div>
    `;
    await emailService.sendEmail(contact.email, subject, text, html);
  } catch (error) {
    // Log email error but don't fail the request

    console.error('Failed to send confirmation email:', error);
  }

  res.status(httpStatus.CREATED).send(contact);
});

export const getContacts = catchAsync(async (req: Request, res: Response) => {
  const filter = pick(req.query, ['status']);
  const options = pick(req.query, ['sortBy', 'limit', 'page', 'projectBy']);
  const result = await contactService.queryContacts(filter, options);
  res.send(result);
});

export const getContact = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['contactId'] === 'string') {
    const contact = await contactService.getContactById(new mongoose.Types.ObjectId(req.params['contactId']));
    if (!contact) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Contact not found');
    }
    res.send(contact);
  }
});

export const updateContact = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['contactId'] === 'string') {
    const contact = await contactService.updateContactById(
      new mongoose.Types.ObjectId(req.params['contactId']),
      req.body
    );
    res.send(contact);
  }
});

export const deleteContact = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['contactId'] === 'string') {
    await contactService.deleteContactById(new mongoose.Types.ObjectId(req.params['contactId']));
    res.status(httpStatus.NO_CONTENT).send();
  }
});
