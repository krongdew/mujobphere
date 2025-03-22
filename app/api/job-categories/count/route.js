import { NextResponse } from 'next/server';
import { query } from '@/lib/db/queries';

export async function GET() {
  try {
    // SQL query to fetch job categories with count of open positions
    const result = await query(`
      SELECT 
        jt.id, 
        jt.name, 
        jt.hire_type,
        COUNT(jp.id) as job_count
      FROM 
        job_type_categories jt
      LEFT JOIN 
        job_posts jp ON jt.id = jp.job_type_id 
        AND jp.status = 'published' 
        AND jp.application_end_date >= CURRENT_DATE
      WHERE 
        jt.is_active = true
      GROUP BY 
        jt.id, jt.name
      ORDER BY 
        jt.name
    `);

    // Cache the response for faster loading
    const response = NextResponse.json(result.rows);
    response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    
    return response;
  } catch (error) {
    console.error('Error fetching job categories with counts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job categories', details: error.message },
      { status: 500 }
    );
  }
}

// Use ISR caching
export const revalidate = 3600; // revalidate every hour
export const dynamic = 'force-dynamic';