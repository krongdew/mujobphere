import { NextResponse } from 'next/server';
import { query } from '@/lib/db/queries';

export async function GET(request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    
    // Explicitly use 'personal' and 'faculty' hire types
    const hireTypes = ['personal', 'faculty'];

    // Fetch job types for specified hire types
    const result = await query(`
      SELECT id, name, hire_type 
      FROM job_type_categories 
      WHERE hire_type = ANY($1) AND is_active = true 
      ORDER BY name
    `, [hireTypes]);

    // Log the result for debugging
    console.log('Job Types Result:', result.rows);

    // Return the job types
    return NextResponse.json(result.rows);
  } catch (error) {
    // Log the full error details
    console.error('Detailed Error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    return NextResponse.json(
      { 
        error: 'Failed to fetch job types', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 400 }
    );
  }
}

// Ensure dynamic routing
export const dynamic = 'force-dynamic';