// app/api/admin/applicant/[id]/route.js
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

    const { id } = params;

    // Get application details
    const applicationResult = await query(
      `SELECT 
        ja.*,
        j.title as job_title,
        j.id as job_id,
        j.user_id as employer_id,
        u.name as applicant_name,
        u.email as applicant_email,
        u.phone as applicant_phone,
        u.line_id as applicant_line_id,
        p.education_level as education,
        p.university as university,
        p.faculty as faculty,
        p.major as major,
        p.education_year as education_year,
        p.bio as bio,
        p.skills as skills,
        p.experience as experience
       FROM job_applications ja
       JOIN job_posts j ON ja.job_post_id = j.id
       LEFT JOIN users u ON ja.user_id = u.id
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE ja.id = $1`,
      [id]
    );

    if (!applicationResult.rows.length) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const application = applicationResult.rows[0];

    // Get employer info
    const employerResult = await query(
      `SELECT 
        u.name as employer_name,
        u.email as employer_email,
        u.phone as employer_phone
       FROM users u
       WHERE u.id = $1`,
      [application.employer_id]
    );

    if (employerResult.rows.length) {
      application.employer = employerResult.rows[0];
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error('Error fetching applicant details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applicant details' },
      { status: 500 }
    );
  }
}