//mujobphere/app/api/job-types-all/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/db/queries';

export async function GET(request) {
  try {
    // ดึงข้อมูลทั้ง personal และ faculty ในครั้งเดียว
    const result = await query(`
      SELECT id, name, hire_type 
      FROM job_type_categories 
      WHERE hire_type IN ('personal', 'faculty') 
      AND is_active = true 
      ORDER BY name
    `);

    // Cache the response for 1 hour
    const response = NextResponse.json(result.rows);
    response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    
    return response;
  } catch (error) {
    console.error('Error fetching job types:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการโหลดประเภทงาน' },
      { status: 500 }
    );
  }
}

// Use ISR caching
export const revalidate = 3600; // revalidate every hour