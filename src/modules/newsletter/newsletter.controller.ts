import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { sendNewsletterWelcomeEmailQueued } from '../email/email.queue';
import catchAsync from '../utils/catchAsync';
import pick from '../utils/pick';
import * as newsletterService from './newsletter.service';

export const subscribe = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  const subscriber = await newsletterService.subscribe(email);
  
  // Send welcome email
  try {
    await sendNewsletterWelcomeEmailQueued(email);
  } catch (error) {
    // Log error but don't fail the subscription
    // Error is already logged in email queue service
  }
  
  res.status(httpStatus.CREATED).send({
    message: 'Successfully subscribed to newsletter',
    subscriber,
  });
});

export const unsubscribe = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  const subscriber = await newsletterService.unsubscribe(email);
  
  res.send({
    message: 'Successfully unsubscribed from newsletter',
    subscriber,
  });
});

export const getSubscribers = catchAsync(async (req: Request, res: Response) => {
  const filter = pick(req.query, ['email', 'isActive']) as Record<string, unknown>;
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await newsletterService.querySubscribers(filter, options);
  res.send(result);
});

export const getStats = catchAsync(async (req: Request, res: Response) => {
  const activeCount = await newsletterService.getActiveSubscribersCount();
  res.send({
    activeSubscribers: activeCount,
  });
});
