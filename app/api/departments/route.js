// app/api/departments/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/db/queries';

export async function GET() {
  try {
    const result = await query(
      'SELECT id, name FROM departments_list WHERE is_active = true ORDER BY name'
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch departments' },
      { status: 500 }
    );
  }
}