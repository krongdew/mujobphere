// app/api/admin/job-types/[id]/status/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/db/queries';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../auth/[...nextauth]/route';

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { is_active } = await request.json();

    // Check if job type exists
    const existingResult = await query(
      'SELECT id FROM job_type_categories WHERE id = $1',
      [id]
    );

    if (existingResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'ไม่พบประเภทงานที่ระบุ' },
        { status: 404 }
      );
    }

    // Update job type status
    const now = new Date();
    const result = await query(
      `UPDATE job_type_categories 
       SET is_active = $1, updated_at = $2 
       WHERE id = $3 
       RETURNING id, name, hire_type, is_active, created_at, updated_at`,
      [is_active, now, id]
    );

    return NextResponse.json({
      message: 'อัพเดทสถานะประเภทงานสำเร็จ',
      jobType: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating job type status:', error);
    return NextResponse.json(
      { error: 'Failed to update job type status' },
      { status: 500 }
    );
  }
}