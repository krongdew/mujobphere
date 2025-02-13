// app/api/job-applications/check/[jobId]/route.js
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { query } from "@/lib/db/queries";

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const jobId = params.jobId;

    // Get user's student profile
    const studentProfileResult = await query(
      'SELECT id FROM student_profiles WHERE user_id = $1',
      [session.user.id]
    );

    if (!studentProfileResult.rows.length) {
      return NextResponse.json({ hasApplied: false });
    }

    // Check if already applied
    const applicationResult = await query(
      `SELECT id FROM job_applications 
       WHERE job_post_id = $1 AND student_profile_id = $2`,
      [jobId, studentProfileResult.rows[0].id]
    );

    return NextResponse.json({
      hasApplied: applicationResult.rows.length > 0
    });

  } catch (error) {
    console.error('Error checking application:', error);
    return NextResponse.json(
      { error: 'Failed to check application status' },
      { status: 500 }
    );
  }
}