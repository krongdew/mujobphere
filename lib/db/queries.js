// import { pool } from '@/utils/db';
// import { sanitizeInput } from '@/lib/security/validation';

// export const query = async (text, params) => {
//   if (!text) {
//     throw new Error('Query text is required');
//   }

//   const client = await pool.connect();
//   try {
//     // ทำความสะอาดพารามิเตอร์
//     const sanitizedParams = params ? params.map(param => sanitizeInput(param)) : [];
    
//     // ลบ rowMode: 'array' ออก
//     const result = await client.query({
//       text,
//       values: sanitizedParams
//     });
//     return result;
//   } catch (error) {
//     console.error('Database Error:', error);
//     throw error;
//   } finally {
//     client.release();
//   }
// };

// lib/db/queries.js
import { pool } from '@/utils/db';
import { sanitizeInput } from '@/lib/security/validation';

export const query = async (text, params, client = null) => {
  if (!text) {
    throw new Error('Query text is required');
  }

  // ถ้าไม่มี client (ไม่ได้อยู่ใน transaction) ให้ใช้ pool.connect()
  const shouldRelease = !client;
  const dbClient = client || await pool.connect();

  try {
    // ทำความสะอาดพารามิเตอร์
    const sanitizedParams = params ? params.map(param => sanitizeInput(param)) : [];
    
    const result = await dbClient.query({
      text,
      values: sanitizedParams
    });
    return result;
  } catch (error) {
    console.error('Database Error:', error);
    throw error;
  } finally {
    // ปล่อย client เฉพาะเมื่อเราเป็นคนสร้างมันขึ้นมา
    if (shouldRelease) {
      dbClient.release();
    }
  }
};

// ฟังก์ชันสำหรับทำ transaction
export const withTransaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};