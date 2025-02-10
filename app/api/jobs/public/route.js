import { NextResponse } from 'next/server';
import { query } from '@/lib/db/queries';

export async function GET() {
  try {
    // Fetch all active and published jobs
    const result = await query(`
      SELECT 
        jp.id, 
        jp.title, 
        jp.hire_type,
        jp.job_type_id,
        jp.job_description,
        jp.application_start_date,
        jp.application_end_date,
        jp.work_start_date,
        jp.work_end_date,
        jp.is_online,
        jp.location,
        jp.compensation_amount,
        jp.compensation_period,
        jp.education_level,
        jt.name as job_type_name
      FROM job_posts jp
      LEFT JOIN job_type_categories jt ON jp.job_type_id = jt.id
      WHERE 
        jp.status = 'published' 
        AND jp.application_end_date >= CURRENT_DATE
      ORDER BY jp.created_at DESC
      LIMIT 100
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching public jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}