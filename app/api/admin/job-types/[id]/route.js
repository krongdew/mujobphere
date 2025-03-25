// app/api/admin/job-types/[id]/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/db/queries';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const result = await query(
      `SELECT id, name, hire_type, is_active, created_at, updated_at 
       FROM job_type_categories 
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'ไม่พบประเภทงานที่ระบุ' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching job type:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job type' },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { name, hire_type, is_active } = await request.json();

    // Validate input
    if (!name || !hire_type) {
      return NextResponse.json(
        { error: 'ชื่อประเภทงานและประเภทการจ้างไม่สามารถเป็นค่าว่างได้' },
        { status: 400 }
      );
    }

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

    // Check if name already exists for another job type with the same hire_type
    const duplicateResult = await query(
      'SELECT id FROM job_type_categories WHERE name = $1 AND hire_type = $2 AND id != $3',
      [name, hire_type, id]
    );

    if (duplicateResult.rows.length > 0) {
      return NextResponse.json(
        { error: 'ชื่อประเภทงานนี้มีอยู่แล้วในประเภทการจ้างที่เลือก' },
        { status: 400 }
      );
    }

    // Update job type
    const now = new Date();
    const result = await query(
      `UPDATE job_type_categories 
       SET name = $1, hire_type = $2, is_active = $3, updated_at = $4 
       WHERE id = $5 
       RETURNING id, name, hire_type, is_active, created_at, updated_at`,
      [name, hire_type, is_active !== false, now, id]
    );

    return NextResponse.json({
      message: 'อัพเดทประเภทงานสำเร็จ',
      jobType: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating job type:', error);
    return NextResponse.json(
      { error: 'Failed to update job type' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Check if job type is being used in any job posts
    const usageResult = await query(
      'SELECT COUNT(*) FROM job_posts WHERE job_type_id = $1',
      [id]
    );

    if (parseInt(usageResult.rows[0].count) > 0) {
      return NextResponse.json(
        { error: 'ไม่สามารถลบประเภทงานนี้ได้เนื่องจากมีประกาศงานที่ใช้งานอยู่' },
        { status: 400 }
      );
    }

    // Delete the job type
    await query(
      'DELETE FROM job_type_categories WHERE id = $1',
      [id]
    );

    return NextResponse.json({
      message: 'ลบประเภทงานสำเร็จ'
    });
  } catch (error) {
    console.error('Error deleting job type:', error);
    return NextResponse.json(
      { error: 'Failed to delete job type' },
      { status: 500 }
    );
  }
}