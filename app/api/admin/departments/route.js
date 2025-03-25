// app/api/admin/departments/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/db/queries';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and has admin role
    if (!session || session?.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await query(
      'SELECT COUNT(*) FROM departments_list'
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated departments
    const result = await query(
      'SELECT id, name, is_active, created_at, updated_at FROM departments_list ORDER BY name LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    return NextResponse.json({
      departments: result.rows,
      total
    });
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch departments' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and has admin role
    if (!session || session?.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, is_active } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Department name is required' },
        { status: 400 }
      );
    }

    // Check if department with same name already exists
    const checkResult = await query(
      'SELECT id FROM departments_list WHERE LOWER(name) = LOWER($1)',
      [name.trim()]
    );

    if (checkResult.rows.length > 0) {
      return NextResponse.json(
        { error: 'Department with this name already exists' },
        { status: 409 }
      );
    }

    // Insert new department
    const result = await query(
      'INSERT INTO departments_list (name, is_active) VALUES ($1, $2) RETURNING id, name, is_active, created_at, updated_at',
      [name.trim(), is_active]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating department:', error);
    return NextResponse.json(
      { error: 'Failed to create department' },
      { status: 500 }
    );
  }
}



