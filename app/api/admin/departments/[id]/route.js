// app/api/admin/departments/[id]/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/db/queries';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and has admin role
    if (!session || session?.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { name, is_active } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Department name is required' },
        { status: 400 }
      );
    }

    // Check if department with same name already exists (excluding current one)
    const checkResult = await query(
      'SELECT id FROM departments_list WHERE LOWER(name) = LOWER($1) AND id != $2',
      [name.trim(), id]
    );

    if (checkResult.rows.length > 0) {
      return NextResponse.json(
        { error: 'Department with this name already exists' },
        { status: 409 }
      );
    }

    // Update department
    const result = await query(
      'UPDATE departments_list SET name = $1, is_active = $2, updated_at = NOW() WHERE id = $3 RETURNING id, name, is_active, created_at, updated_at',
      [name.trim(), is_active, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating department:', error);
    return NextResponse.json(
      { error: 'Failed to update department' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and has admin role
    if (!session || session?.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Check if department is in use
    const usageCheck = await query(
      'SELECT COUNT(*) FROM users WHERE id = $1',
      [id]
    );

    if (parseInt(usageCheck.rows[0].count) > 0) {
      return NextResponse.json(
        { error: 'Cannot delete department that is assigned to users' },
        { status: 400 }
      );
    }

    // Delete department
    const result = await query(
      'DELETE FROM departments_list WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting department:', error);
    return NextResponse.json(
      { error: 'Failed to delete department' },
      { status: 500 }
    );
  }
}

