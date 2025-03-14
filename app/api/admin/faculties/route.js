// app/api/admin/faculties/route.js
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
      'SELECT COUNT(*) FROM faculties_list'
    );
    const total = parseInt(countResult.rows[0].count);

    // Fetch faculties with pagination
    const facultiesResult = await query(
      `SELECT id, name, is_active, created_at, updated_at 
       FROM faculties_list 
       ORDER BY name ASC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return NextResponse.json({
      faculties: facultiesResult.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching faculties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch faculties' },
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

    const { name, is_active } = await request.json();

    // Validate input
    if (!name) {
      return NextResponse.json(
        { error: 'ชื่อคณะไม่สามารถเป็นค่าว่างได้' },
        { status: 400 }
      );
    }

    // Check if name already exists
    const existingResult = await query(
      'SELECT id FROM faculties_list WHERE name = $1',
      [name]
    );

    if (existingResult.rows.length > 0) {
      return NextResponse.json(
        { error: 'ชื่อคณะนี้มีอยู่แล้ว' },
        { status: 400 }
      );
    }

    // Insert new faculty
    const now = new Date();
    const result = await query(
      `INSERT INTO faculties_list (name, is_active, created_at, updated_at) 
       VALUES ($1, $2, $3, $3) 
       RETURNING id, name, is_active, created_at, updated_at`,
      [name, is_active !== false, now]
    );

    return NextResponse.json({
      message: 'เพิ่มคณะสำเร็จ',
      faculty: result.rows[0]
    });
  } catch (error) {
    console.error('Error adding faculty:', error);
    return NextResponse.json(
      { error: 'Failed to add faculty' },
      { status: 500 }
    );
  }
}
