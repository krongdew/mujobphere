// app/api/student/profile/public/[id]/route.js
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { query } from "@/lib/db/queries";

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['employer', 'employeroutside', 'student'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const studentProfileId = params.id;

    // Get student profile data with user information
    const profileResult = await query(
      `SELECT 
        sp.id, sp.user_id, sp.student_id, sp.first_name, sp.last_name,
        sp.faculty, sp.major, sp.gpa, sp.birth_date,
        sp.img_student, sp.description, sp.cv_file,
        sp.language_skills, sp.programming_skills, sp.other_skills,
        sp.phone, sp.address,
        u.email, u.name, u.profile_image, u.department, u.faculty as user_faculty
      FROM student_profiles sp
      JOIN users u ON sp.user_id = u.id
      WHERE sp.id = $1`,
      [studentProfileId]
    );

    if (!profileResult.rows.length) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Get education history
    const educationResult = await query(
      `SELECT 
        id, school_name, degree, field_of_study,
        start_date, end_date, description
      FROM student_educations
      WHERE student_profile_id = $1
      ORDER BY start_date DESC`,
      [studentProfileId]
    );

    // Get experience history
    const experienceResult = await query(
      `SELECT 
        id, company_name, position,
        start_date, end_date, description
      FROM student_experiences
      WHERE student_profile_id = $1
      ORDER BY start_date DESC`,
      [studentProfileId]
    );

    // Get awards
    const awardsResult = await query(
      `SELECT 
        id, title, issuer,
        date_received, description
      FROM student_awards
      WHERE student_profile_id = $1
      ORDER BY date_received DESC`,
      [studentProfileId]
    );

    return NextResponse.json({
      ...profileResult.rows[0],
      education: educationResult.rows,
      experience: experienceResult.rows,
      awards: awardsResult.rows
    });
  } catch (error) {
    console.error('Failed to fetch student profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student profile' },
      { status: 500 }
    );
  }
}