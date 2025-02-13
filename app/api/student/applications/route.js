// app/api/student/applications/route.js
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { query } from "@/lib/db/queries";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get student profile id
    const profileResult = await query(
      'SELECT id FROM student_profiles WHERE user_id = $1',
      [session.user.id]
    );

    if (!profileResult.rows.length) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    // Get applications with job and employer details
    const applications = await query(`
      SELECT 
        ja.*,
        jp.title as job_title,
        jp.location,
        jp.user_id as employer_id,
        u.department,
        u.role as employer_role,
        CASE 
          WHEN u.role = 'employer' THEN u.name
          WHEN u.role = 'employeroutside' THEN eop.company_name
          ELSE u.department
        END as company_name,
        COALESCE(eop.company_logo, ep.company_logo) as company_logo
      FROM job_applications ja
      JOIN job_posts jp ON ja.job_post_id = jp.id
      JOIN users u ON jp.user_id = u.id
      LEFT JOIN employer_profiles ep ON jp.user_id = ep.user_id
      LEFT JOIN employer_outside_profiles eop ON jp.user_id = eop.user_id
      WHERE ja.student_profile_id = $1
      ORDER BY ja.applied_at DESC
    `, [profileResult.rows[0].id]);

    console.log('Applications found:', applications.rows);

    return NextResponse.json(applications.rows);

  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}