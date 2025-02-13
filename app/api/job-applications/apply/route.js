// app/api/job-applications/apply/route.js
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { query } from "@/lib/db/queries";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's student profile
    const studentProfileResult = await query(
      'SELECT id FROM student_profiles WHERE user_id = $1',
      [session.user.id]
    );

    if (!studentProfileResult.rows.length) {
      return NextResponse.json(
        { error: 'Student profile not found' },
        { status: 404 }
      );
    }

    const { job_post_id, message } = await request.json();

    // Check if already applied
    const existingApplication = await query(
      `SELECT id FROM job_applications 
       WHERE job_post_id = $1 AND student_profile_id = $2`,
      [job_post_id, studentProfileResult.rows[0].id]
    );

    if (existingApplication.rows.length > 0) {
      return NextResponse.json(
        { error: 'You have already applied for this job' },
        { status: 400 }
      );
    }

    // Create new application
    const result = await query(
      `INSERT INTO job_applications (
        job_post_id,
        student_profile_id,
        status,
        notes,
        applied_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *`,
      [
        job_post_id,
        studentProfileResult.rows[0].id,
        'pending',
        message || null
      ]
    );

    return NextResponse.json(result.rows[0]);

  } catch (error) {
    console.error('Error applying for job:', error);
    return NextResponse.json(
      { error: 'Failed to apply for job' },
      { status: 500 }
    );
  }
}