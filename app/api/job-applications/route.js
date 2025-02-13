// app/api/job-applications/route.js
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { query } from "@/lib/db/queries";

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || 
        (session.user.role !== 'employer' && session.user.role !== 'employeroutside')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get job applications with student user_id
    const applications = await query(`
      SELECT 
        ja.*,
        sp.first_name,
        sp.last_name,
        sp.faculty,
        sp.major,
        sp.gpa,
        sp.img_student,
        sp.programming_skills,
        sp.language_skills,
        sp.user_id as student_user_id,  -- เพิ่ม user_id ของนักศึกษา
        jp.title as job_title,
        jp.user_id as employer_user_id
      FROM job_applications ja
      JOIN student_profiles sp ON ja.student_profile_id = sp.id
      JOIN job_posts jp ON ja.job_post_id = jp.id
      WHERE jp.user_id = $1
      ORDER BY ja.applied_at DESC
    `, [session.user.id]);

    return NextResponse.json(applications.rows);

  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}