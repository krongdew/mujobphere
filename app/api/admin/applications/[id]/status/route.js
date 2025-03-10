// app/api/admin/applicants/[applicationId]/route.js
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

    const { applicationId } = params;

    // Get application details based on your schema
    const applicationResult = await query(
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
        jp.id as job_id,
        jp.user_id as employer_user_id
      FROM job_applications ja
      JOIN student_profiles sp ON ja.student_profile_id = sp.id
      JOIN job_posts jp ON ja.job_post_id = jp.id
      WHERE ja.id = $1`,
      [applicationId]
    );

    if (!applicationResult.rows.length) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const application = applicationResult.rows[0];

    // Get more student details if needed
    const studentUserResult = await query(
      `SELECT u.email, u.phone, u.line_id 
       FROM users u 
       WHERE u.id = $1`,
      [application.student_user_id]
    );

    if (studentUserResult.rows.length) {
      application.student_email = studentUserResult.rows[0].email;
      application.student_phone = studentUserResult.rows[0].phone;
      application.student_line_id = studentUserResult.rows[0].line_id;
    }

    // Get employer info
    const employerResult = await query(
      `SELECT 
        u.name as employer_name,
        u.email as employer_email,
        u.phone as employer_phone
       FROM users u
       WHERE u.id = $1`,
      [application.employer_user_id]
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