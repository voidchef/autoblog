/**
 * Frontend crypto utilities for OpenAI key encryption
 * Uses Web Crypto API for browser-based encryption
 */

/**
 * Convert a string to ArrayBuffer
 */
const stringToArrayBuffer = (str: string): ArrayBuffer => {
  const encoder = new TextEncoder();
  const uint8Array = encoder.encode(str);
  return uint8Array.buffer.slice(uint8Array.byteOffset, uint8Array.byteOffset + uint8Array.byteLength) as ArrayBuffer;
};

/**
 * Convert ArrayBuffer to string
 */
const arrayBufferToString = (buffer: ArrayBuffer): string => {
  const decoder = new TextDecoder();
  return decoder.decode(buffer);
};

/**
 * Convert ArrayBuffer to hex string
 */
const arrayBufferToHex = (buffer: ArrayBuffer): string => {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * Convert hex string to ArrayBuffer
 */
const hexToArrayBuffer = (hex: string): ArrayBuffer => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes.buffer;
};

/**
 * Derive encryption key from a password using PBKDF2
 */
const deriveKey = async (password: string, salt: ArrayBuffer): Promise<CryptoKey> => {
  const passwordBuffer = stringToArrayBuffer(password);
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
};

/**
 * Encrypt text using AES-GCM
 * @param {string} text - The text to encrypt
 * @param {string} password - The password for encryption (user ID)
 * @returns {Promise<string>} - The encrypted text with salt and IV
 */
export const encryptOpenAiKey = async (text: string, password: string): Promise<string> => {
  if (!text) return '';

  try {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const key = await deriveKey(password, salt.buffer);
    const encodedText = stringToArrayBuffer(text);
    
    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encodedText
    );

    // Combine salt, IV, and encrypted data
    const saltHex = arrayBufferToHex(salt.buffer);
    const ivHex = arrayBufferToHex(iv.buffer);
    const encryptedHex = arrayBufferToHex(encrypted);
    
    return `${saltHex}:${ivHex}:${encryptedHex}`;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt OpenAI key');
  }
};

/**
 * Decrypt text using AES-GCM
 * @param {string} encryptedText - The encrypted text with salt and IV
 * @param {string} password - The password for decryption (user ID)
 * @returns {Promise<string>} - The decrypted text
 */
export const decryptOpenAiKey = async (encryptedText: string, password: string): Promise<string> => {
  if (!encryptedText) return '';

  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }

    const [saltHex, ivHex, encryptedHex] = parts;
    const salt = hexToArrayBuffer(saltHex);
    const iv = hexToArrayBuffer(ivHex);
    const encrypted = hexToArrayBuffer(encryptedHex);

    const key = await deriveKey(password, salt);
    
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encrypted
    );

    return arrayBufferToString(decrypted);
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
