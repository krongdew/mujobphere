// app/api/admin/job-types/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/db/queries';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get pagination parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const offset = (page - 1) * limit;

    // Fetch total count
    const countResult = await query(
      'SELECT COUNT(*) FROM job_type_categories'
    );
    const total = parseInt(countResult.rows[0].count);

    // Fetch job types with pagination
    const jobTypesResult = await query(
      `SELECT id, name, hire_type, is_active, created_at, updated_at 
       FROM job_type_categories 
       ORDER BY name ASC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return NextResponse.json({
      jobTypes: jobTypesResult.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching job types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job types' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, hire_type, is_active } = await request.json();

    // Validate input
    if (!name || !hire_type) {
      return NextResponse.json(
        { error: 'ชื่อประเภทงานและประเภทการจ้างไม่สามารถเป็นค่าว่างได้' },
        { status: 400 }
      );
    }

    // Check if name already exists for the same hire_type
    const existingResult = await query(
      'SELECT id FROM job_type_categories WHERE name = $1 AND hire_type = $2',
      [name, hire_type]
    );

    if (existingResult.rows.length > 0) {
      return NextResponse.json(
        { error: 'ชื่อประเภทงานนี้มีอยู่แล้วในประเภทการจ้างที่เลือก' },
        { status: 400 }
      );
    }

    // Insert new job type
    const now = new Date();
    const result = await query(
      `INSERT INTO job_type_categories (name, hire_type, is_active, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $4) 
       RETURNING id, name, hire_type, is_active, created_at, updated_at`,
      [name, hire_type, is_active !== false, now]
    );

    return NextResponse.json({
      message: 'เพิ่มประเภทงานสำเร็จ',
      jobType: result.rows[0]
    });
  } catch (error) {
    console.error('Error adding job type:', error);
    return NextResponse.json(
      { error: 'Failed to add job type' },
      { status: 500 }
    );
  }
}