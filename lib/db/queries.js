import { pool } from '@/utils/db';
import { sanitizeInput, validateEmail } from '@/lib/security/validation';

export const query = async (text, params) => {
  const client = await pool.connect();
  try {
    // ทำความสะอาดพารามิเตอร์
    const sanitizedParams = params.map(param => sanitizeInput(param));
    
    // ป้องกัน SQL Injection
    const result = await client.query({
      text: text,
      values: sanitizedParams,
      rowMode: 'array'
    });
    return result;
  } catch (error) {
    console.error('Database Error:', error);
    throw error;
  } finally {
    client.release();
  }
};