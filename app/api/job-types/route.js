// app/api/job-types/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/db/queries';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get hire_type from query parameters
    const { searchParams } = new URL(request.url);
    const hireType = searchParams.get('hire_type');

    if (!hireType) {
      return NextResponse.json({ error: 'Hire type is required' }, { status: 400 });
    }

    // Fetch job types based on hire_type
    const result = await query(
      'SELECT id, name FROM job_type_categories WHERE hire_type = $1 AND is_active = true ORDER BY name',
      [hireType]
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching job types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job types' },
      { status: 500 }
    );
  }
}