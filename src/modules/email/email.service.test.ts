import { jest, describe, test, expect, beforeAll, beforeEach } from '@jest/globals';
import * as emailService from './email.service';
import config from '../../config/config';

interface EmailOptions {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
}

const mockSendMail = jest.fn<(options: EmailOptions) => Promise<any>>();
const mockVerify = jest.fn<() => Promise<boolean>>().mockResolvedValue(true);

describe('Email Service', () => {
  beforeAll(() => {
    // Set up mock transport
    const mockTransport = {
      sendMail: mockSendMail,
      verify: mockVerify,
    } as any;

    emailService.setTransport(mockTransport);
  });

  beforeEach(() => {
    mockSendMail.mockClear();
  });

  describe('sendEmail', () => {
    test('should send email with correct parameters', async () => {
      const to = 'test@example.com';
      const subject = 'Test Subject';
      const text = 'Test text content';
      const html = '<p>Test HTML content</p>';

      await emailService.sendEmail(to, subject, text, html);

      expect(mockSendMail).toHaveBeenCalledWith({
        from: config.email.from,
        to,
        subject,
        text,
        html,
      });
      expect(mockSendMail).toHaveBeenCalledTimes(1);
    });

    test('should throw error if sendMail fails', async () => {
      const error = new Error('Email send failed');
      mockSendMail.mockRejectedValueOnce(error as any);

      await expect(emailService.sendEmail('test@example.com', 'Subject', 'Text', 'HTML')).rejects.toThrow(
        'Email send failed',
      );
    });
  });

  describe('sendResetPasswordEmail', () => {
    test('should send reset password email with token', async () => {
      const to = 'user@example.com';
      const token = 'reset-token-123';

      await emailService.sendResetPasswordEmail(to, token);

      expect(mockSendMail).toHaveBeenCalledTimes(1);
      const callArgs = mockSendMail.mock.calls[0]?.[0] as EmailOptions;

      expect(callArgs.to).toBe(to);
      expect(callArgs.subject).toBe('Reset password');
      expect(callArgs.text).toContain(token);
      expect(callArgs.html).toContain(token);
      expect(callArgs.text).toContain('reset your password');
      expect(callArgs.html).toContain('reset your password');
    });

    test('should include reset password URL in email', async () => {
      const to = 'user@example.com';
      const token = 'reset-token-456';

      await emailService.sendResetPasswordEmail(to, token);

      const callArgs = mockSendMail.mock.calls[0]?.[0] as EmailOptions;
      const expectedUrl = `http://${config.clientUrl}/reset-password?token=${token}`;

      expect(callArgs.text).toContain(expectedUrl);
      expect(callArgs.html).toContain(expectedUrl);
    });
  });

  describe('sendVerificationEmail', () => {
    test('should send verification email with token and name', async () => {
      const to = 'user@example.com';
      const token = 'verify-token-123';
      const name = 'John Doe';

      await emailService.sendVerificationEmail(to, token, name);

      expect(mockSendMail).toHaveBeenCalledTimes(1);
      const callArgs = mockSendMail.mock.calls[0]?.[0] as EmailOptions;

      expect(callArgs.to).toBe(to);
      expect(callArgs.subject).toBe('Email Verification');
      expect(callArgs.text).toContain(name);
      expect(callArgs.html).toContain(name);
      expect(callArgs.text).toContain(token);
      expect(callArgs.html).toContain(token);
    });

    test('should include verification URL in email', async () => {
      const to = 'user@example.com';
      const token = 'verify-token-456';
      const name = 'Jane Smith';

      await emailService.sendVerificationEmail(to, token, name);

      const callArgs = mockSendMail.mock.calls[0]?.[0] as EmailOptions;
      const expectedUrl = `http://${config.clientUrl}/verify-email?token=${token}`;

      expect(callArgs.text).toContain(expectedUrl);
      expect(callArgs.html).toContain(expectedUrl);
    });
  });

  describe('sendSuccessfulRegistration', () => {
    test('should send registration success email', async () => {
      const to = 'newuser@example.com';
      const token = 'registration-token-123';
      const name = 'New User';

      await emailService.sendSuccessfulRegistration(to, token, name);

      expect(mockSendMail).toHaveBeenCalledTimes(1);
      const callArgs = mockSendMail.mock.calls[0]?.[0] as EmailOptions;

      expect(callArgs.to).toBe(to);
      expect(callArgs.subject).toBe('Email Verification');
      expect(callArgs.text).toContain(name);
      expect(callArgs.html).toContain(name);
      expect(callArgs.text).toContain('Congratulations');
      expect(callArgs.html).toContain('Congratulations');
      expect(callArgs.text).toContain(token);
      expect(callArgs.html).toContain(token);
    });

    test('should include verification URL for new registration', async () => {
      const to = 'newuser@example.com';
      const token = 'registration-token-789';
      const name = 'Test User';

      await emailService.sendSuccessfulRegistration(to, token, name);

      const callArgs = mockSendMail.mock.calls[0]?.[0] as EmailOptions;
      const expectedUrl = `http://${config.clientUrl}/verify-email?token=${token}`;

      expect(callArgs.text).toContain(expectedUrl);
      expect(callArgs.html).toContain(expectedUrl);
    });

    test('should include account creation message', async () => {
      const to = 'newuser@example.com';
      const token = 'token';
      const name = 'User';

      await emailService.sendSuccessfulRegistration(to, token, name);

      const callArgs = mockSendMail.mock.calls[0]?.[0] as EmailOptions;

      expect(callArgs.text).toContain('account has been created');
      expect(callArgs.html).toContain('account has been created');
    });
  });
});
