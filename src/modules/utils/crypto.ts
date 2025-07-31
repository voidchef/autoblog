import crypto from 'crypto';
import config from '../../config/config';

const algorithm = 'aes-256-gcm';
const secretKey = config.jwt.secret; // Using JWT secret as encryption key
const keyBuffer = crypto.scryptSync(secretKey, 'salt', 32); // Derive a 32-byte key

/**
 * Encrypt text using AES-256-GCM
 * @param {string} text - The text to encrypt
 * @returns {string} - The encrypted text with IV and auth tag
 */
export const encrypt = (text: string): string => {
  if (!text) return '';
  
  const iv = crypto.randomBytes(16); // Generate random IV
  const cipher = crypto.createCipheriv(algorithm, keyBuffer, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // Combine IV, auth tag, and encrypted data
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
};

/**
 * Decrypt text using AES-256-GCM
 * @param {string} encryptedText - The encrypted text with IV and auth tag
 * @returns {string} - The decrypted text
 */
export const decrypt = (encryptedText: string): string => {
  if (!encryptedText) return '';
  
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }
    
    const [ivHex, authTagHex, encrypted] = parts;
    
    if (!ivHex || !authTagHex || !encrypted) {
      throw new Error('Missing encryption components');
    }
    
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipheriv(algorithm, keyBuffer, iv);
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
  return parts.length === 3 && parts.every(part => /^[0-9a-f]+$/i.test(part));
};
