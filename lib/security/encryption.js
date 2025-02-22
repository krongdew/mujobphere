// lib/security/encryption.js
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
if (!ENCRYPTION_KEY) {
  throw new Error('ENCRYPTION_KEY must be set in environment variables');
}

// สร้าง key ที่มีความยาวถูกต้องโดยใช้ hash
const KEY = crypto.createHash('sha256').update(String(ENCRYPTION_KEY)).digest();
const IV_LENGTH = 16;

export const encrypt = (text) => {
  // ถ้าไม่มีข้อมูล หรือข้อมูลเป็น null/undefined ให้ return ค่านั้นกลับไป
  if (!text) return text;
  
  try {
    // แปลงข้อมูลให้เป็น string เสมอ
    const textToEncrypt = String(text);
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', KEY, iv);
    let encrypted = cipher.update(textToEncrypt);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
  } catch (error) {
    console.error('Encryption error:', error);
    // ถ้าเกิด error ให้ return ข้อมูลเดิม
    return text;
  }
};

export const decrypt = (text) => {
  // เพิ่มการตรวจสอบ type
  if (text === null || text === undefined || typeof text !== 'string') {
    return text;
  }
  
  // ถ้าเป็น string เปล่า
  if (text.trim() === '') {
    return text;
  }
  
  // ถ้าไม่มีรูปแบบการเข้ารหัส
  if (!text.includes(':')) {
    return text;
  }
  
  try {
    const [ivHex, encryptedHex] = text.split(':');
    // เพิ่มการตรวจสอบความถูกต้องของ hex
    if (!ivHex || !encryptedHex) {
      return text;
    }
    
    const iv = Buffer.from(ivHex, 'hex');
    const encryptedText = Buffer.from(encryptedHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', KEY, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    console.error('Decryption error:', error);
    return text;
  }
};