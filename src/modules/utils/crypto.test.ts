import { encrypt, decrypt, isEncrypted } from './crypto';

describe('crypto utilities', () => {
  const password = 'test-password-123';
  const plainText = 'This is a secret message';

  describe('encrypt', () => {
    test('should encrypt text successfully', () => {
      const encrypted = encrypt(plainText, password);
      
      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('string');
      expect(encrypted).not.toBe(plainText);
      expect(encrypted.split(':')).toHaveLength(4); // salt:iv:authTag:encrypted
    });

    test('should return empty string for empty input', () => {
      const encrypted = encrypt('', password);
      
      expect(encrypted).toBe('');
    });

    test('should produce different outputs for same input (due to random salt and IV)', () => {
      const encrypted1 = encrypt(plainText, password);
      const encrypted2 = encrypt(plainText, password);
      
      expect(encrypted1).not.toBe(encrypted2);
    });
  });

  describe('decrypt', () => {
    test('should decrypt encrypted text successfully', () => {
      const encrypted = encrypt(plainText, password);
      const decrypted = decrypt(encrypted, password);
      
      expect(decrypted).toBe(plainText);
    });

    test('should return empty string for empty input', () => {
      const decrypted = decrypt('', password);
      
      expect(decrypted).toBe('');
    });

    test('should return empty string for invalid format', () => {
      const decrypted = decrypt('invalid:format', password);
      
      expect(decrypted).toBe('');
    });

    test('should return empty string for wrong password', () => {
      const encrypted = encrypt(plainText, password);
      const decrypted = decrypt(encrypted, 'wrong-password');
      
      expect(decrypted).toBe('');
    });

    test('should handle long text', () => {
      const longText = 'A'.repeat(1000);
      const encrypted = encrypt(longText, password);
      const decrypted = decrypt(encrypted, password);
      
      expect(decrypted).toBe(longText);
    });

    test('should handle special characters', () => {
      const specialText = '!@#$%^&*()_+-=[]{}|;:\'",.<>?/~`';
      const encrypted = encrypt(specialText, password);
      const decrypted = decrypt(encrypted, password);
      
      expect(decrypted).toBe(specialText);
    });

    test('should handle unicode characters', () => {
      const unicodeText = '你好世界 🌍 Привет مرحبا';
      const encrypted = encrypt(unicodeText, password);
      const decrypted = decrypt(encrypted, password);
      
      expect(decrypted).toBe(unicodeText);
    });
  });

  describe('isEncrypted', () => {
    test('should return true for encrypted text', () => {
      const encrypted = encrypt(plainText, password);
      
      expect(isEncrypted(encrypted)).toBe(true);
    });

    test('should return false for plain text', () => {
      expect(isEncrypted(plainText)).toBe(false);
    });

    test('should return false for empty string', () => {
      expect(isEncrypted('')).toBe(false);
    });

    test('should return false for malformed encrypted text', () => {
      expect(isEncrypted('abc:def')).toBe(false);
      expect(isEncrypted('abc:def:ghi')).toBe(false);
    });

    test('should return true for properly formatted encrypted string', () => {
      // Format: salt:iv:authTag:encrypted (all hex strings)
      const mockEncrypted = 'a'.repeat(32) + ':' + 'b'.repeat(24) + ':' + 'c'.repeat(32) + ':' + 'd'.repeat(32);
      
      expect(isEncrypted(mockEncrypted)).toBe(true);
    });
  });

  describe('encryption/decryption integration', () => {
    test('should maintain data integrity through multiple encrypt/decrypt cycles', () => {
      let text = plainText;
      
      for (let i = 0; i < 5; i++) {
        const encrypted = encrypt(text, password);
        text = decrypt(encrypted, password);
      }
      
      expect(text).toBe(plainText);
    });

    test('should work with different passwords for different users', () => {
      const password1 = 'user1-password';
      const password2 = 'user2-password';
      const secret1 = 'User 1 secret';
      const secret2 = 'User 2 secret';
      
      const encrypted1 = encrypt(secret1, password1);
      const encrypted2 = encrypt(secret2, password2);
      
      expect(decrypt(encrypted1, password1)).toBe(secret1);
      expect(decrypt(encrypted2, password2)).toBe(secret2);
      expect(decrypt(encrypted1, password2)).toBe(''); // Wrong password
      expect(decrypt(encrypted2, password1)).toBe(''); // Wrong password
    });
  });
});
