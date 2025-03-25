// app/api/admin/departments/[id]/status/route.js
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
    const { is_active } = body;

    if (typeof is_active !== 'boolean') {
      return NextResponse.json(
        { error: 'is_active must be a boolean value' },
        { status: 400 }
      );
    }

    // Update department status
    const result = await query(
      'UPDATE departments_list SET is_active = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name, is_active, created_at, updated_at',
      [is_active, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating department status:', error);
    return NextResponse.json(
      { error: 'Failed to update department status' },
      { status: 500 }
    );
  }
}

