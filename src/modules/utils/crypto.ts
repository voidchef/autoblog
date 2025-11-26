import crypto from 'crypto';

const algorithm = 'aes-256-gcm';

/**
 * Derive encryption key from a password using PBKDF2
 */
const deriveKey = (password: string, salt: Buffer): Buffer => {
  return crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
};

/**
 * Encrypt text using AES-256-GCM with PBKDF2 key derivation
 * @param {string} text - The text to encrypt
 * @param {string} password - The password for encryption (user ID)
 * @returns {string} - The encrypted text with salt, IV and auth tag
 */
export const encrypt = (text: string, password: string): string => {
  if (!text) return '';

  const salt = crypto.randomBytes(16); // Generate random salt
  const iv = crypto.randomBytes(12); // Generate random IV (12 bytes for GCM)
  const key = deriveKey(password, salt);

  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // Combine salt, IV, auth tag, and encrypted data
  return `${salt.toString('hex')}:${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
};

/**
 * Decrypt text using AES-256-GCM with PBKDF2 key derivation
 * @param {string} encryptedText - The encrypted text with salt, IV and auth tag
 * @param {string} password - The password for decryption (user ID)
 * @returns {string} - The decrypted text
 */
export const decrypt = (encryptedText: string, password: string): string => {
  if (!encryptedText) return '';

  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 4) {
      throw new Error('Invalid encrypted data format');
    }

    const [saltHex, ivHex, authTagHex, encrypted] = parts;

    if (!saltHex || !ivHex || !authTagHex || !encrypted) {
      throw new Error('Missing encryption components');
    }

    const salt = Buffer.from(saltHex, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const key = deriveKey(password, salt);

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return '';
  }
};

/**
 * Check if a value is encrypted (has the expected format)
 * @param {string} value - The value to check
 * @returns {boolean} - True if the value appears to be encrypted
 */
export const isEncrypted = (value: string): boolean => {
  if (!value) return false;
  const parts = value.split(':');
  return parts.length === 4 && parts.every((part) => /^[0-9a-f]+$/i.test(part));
};
