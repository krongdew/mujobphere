// app/api/admin/jobs/[id]/applicants/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/db/queries';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../auth/[...nextauth]/route';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const jobId = params.id;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Get total count of applicants for this job
    const countResult = await query(
      `SELECT COUNT(*) as total
       FROM job_applications
       WHERE job_post_id = $1`,
      [jobId]
    );
    
    const total = parseInt(countResult.rows[0].total);

    // Get applicants with pagination based on your actual schema
    const applicantsResult = await query(
      `SELECT 
        ja.*,
        sp.first_name,
        sp.last_name,
        sp.faculty,
        sp.major,
        sp.gpa,
        sp.img_student,
        sp.programming_skills,
        sp.language_skills,
        sp.user_id as student_user_id,
        jp.title as job_title,
        jp.user_id as employer_user_id
      FROM job_applications ja
      JOIN student_profiles sp ON ja.student_profile_id = sp.id
      JOIN job_posts jp ON ja.job_post_id = jp.id
      WHERE ja.job_post_id = $1
      ORDER BY ja.applied_at DESC
      LIMIT $2 OFFSET $3`,
      [jobId, limit, offset]
    );

    return NextResponse.json({
      applicants: applicantsResult.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching applicants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applicants' },
      { status: 500 }
    );
  }
}