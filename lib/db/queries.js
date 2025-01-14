import { pool } from '@/utils/db';
import { sanitizeInput } from '@/lib/security/validation';

export const query = async (text, params) => {
  if (!text) {
    throw new Error('Query text is required');
  }

  const client = await pool.connect();
  try {
    // ทำความสะอาดพารามิเตอร์
    const sanitizedParams = params ? params.map(param => sanitizeInput(param)) : [];
    
    // ลบ rowMode: 'array' ออก
    const result = await client.query({
      text,
      values: sanitizedParams
    });
    return result;
  } catch (error) {
    console.error('Database Error:', error);
    throw error;
  } finally {
    client.release();
  }
};