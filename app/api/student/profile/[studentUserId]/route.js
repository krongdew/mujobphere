// app/api/student/profile/[studentUserId]/route.js
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { query } from "@/lib/db/queries";
import { decrypt } from "@/lib/security/encryption";

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

    // ถอดรหัสข้อมูลที่เป็นความลับ
    const decryptedData = {
      ...studentData,
      phone: decrypt(studentData.phone),
      address: decrypt(studentData.address),
      birth_date: decrypt(studentData.birth_date)
    };

    // Format the response
    const response = {
      id: decryptedData.id,
      name: decryptedData.name,
      email: decryptedData.email,
      department: decryptedData.department,
      faculty: decryptedData.faculty,
      profile: {
        id: decryptedData.profile_id,
        student_id: decryptedData.student_id,
        first_name: decryptedData.first_name,
        last_name: decryptedData.last_name,
        faculty: decryptedData.faculty,
        major: decryptedData.major,
        gpa: decryptedData.gpa,
        birth_date: decryptedData.birth_date, // ถอดรหัสแล้ว
        img_student: decryptedData.img_student,
        description: decryptedData.description,
        cv_file: decryptedData.cv_file,
        language_skills: decryptedData.language_skills,
        programming_skills: decryptedData.programming_skills,
        other_skills: decryptedData.other_skills,
        phone: decryptedData.phone, // ถอดรหัสแล้ว
        address: decryptedData.address // ถอดรหัสแล้ว
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