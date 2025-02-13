// app/api/student/profile/[studentUserId]/route.js
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

    const studentUserId = params.studentUserId;
    console.log('Fetching profile for student ID:', studentUserId);

 // Get user and profile data
 const result = await query(`
  SELECT 
    u.id, u.name, u.email, u.profile_image, u.department,
    sp.id as profile_id, sp.student_id, sp.first_name, sp.last_name,
    sp.faculty, 
    sp.major, sp.gpa, sp.birth_date,
    sp.img_student, sp.description, sp.cv_file,
    sp.language_skills, sp.programming_skills, sp.other_skills,
    sp.phone, sp.address
  FROM users u
  LEFT JOIN student_profiles sp ON u.id = sp.user_id
  WHERE u.id = $1 AND u.role = 'student'
`, [studentUserId]);

if (result.rows.length === 0) {
  return NextResponse.json({ error: 'Student not found' }, { status: 404 });
}

const studentData = result.rows[0];

    // Get education history
    const educationResult = await query(`
      SELECT id, school_name, degree, field_of_study,
        start_date, end_date, description
      FROM student_educations
      WHERE student_profile_id = $1
      ORDER BY start_date DESC
    `, [studentData.profile_id]);

    // Get experience history
    const experienceResult = await query(`
      SELECT id, company_name, position,
        start_date, end_date, description
      FROM student_experiences
      WHERE student_profile_id = $1
      ORDER BY start_date DESC
    `, [studentData.profile_id]);

    // Get awards
    const awardsResult = await query(`
      SELECT id, title, issuer,
        date_received, description
      FROM student_awards
      WHERE student_profile_id = $1
      ORDER BY date_received DESC
    `, [studentData.profile_id]);

  // Format the response
  const response = {
    id: studentData.id,
    name: studentData.name,
    email: studentData.email,
    department: studentData.department,
    faculty: studentData.faculty, // ใช้ชื่อคณะโดยตรงจาก faculty
    profile: {
      id: studentData.profile_id,
      student_id: studentData.student_id,
      first_name: studentData.first_name,
      last_name: studentData.last_name,
      faculty: studentData.faculty, // ใช้ชื่อคณะโดยตรงจาก faculty
      major: studentData.major,
      gpa: studentData.gpa,
      birth_date: studentData.birth_date,
      img_student: studentData.img_student,
      description: studentData.description,
      cv_file: studentData.cv_file,
      language_skills: studentData.language_skills,
      programming_skills: studentData.programming_skills,
      other_skills: studentData.other_skills,
      phone: studentData.phone,
      address: studentData.address
    },
      education: educationResult.rows,
      experience: experienceResult.rows,
      awards: awardsResult.rows
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Failed to fetch student profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student profile' },
      { status: 500 }
    );
  }
}