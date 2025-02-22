import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { query } from "@/lib/db/queries";

export async function GET(request, { params }) {
  try {
    // 1. Authentication & Authorization
    const session = await getServerSession(authOptions);
    if (!session || !['employer', 'employeroutside', 'student'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized access' }, 
        { status: 401 }
      );
    }

    // 2. Input Validation
    const studentProfileId = params.id;
    if (!studentProfileId || !Number.isInteger(Number(studentProfileId))) {
      return NextResponse.json(
        { error: 'Invalid profile ID' },
        { status: 400 }
      );
    }

    // 3. Parallel Query Execution with SQL Injection Protection
    const [profileResult, educationResult, experienceResult, awardsResult] = await Promise.all([
      // Profile and User Information
      query(
        `SELECT 
          sp.id, 
          sp.user_id,
          sp.student_id,
          sp.first_name,
          sp.last_name,
          sp.faculty,
          sp.major,
          sp.gpa,
          sp.birth_date,
          sp.img_student,
          CASE 
            WHEN $1 = sp.user_id THEN sp.description
            ELSE COALESCE(sp.public_description, sp.description)
          END as description,
          CASE 
            WHEN $1 = sp.user_id THEN sp.cv_file
            ELSE NULL
          END as cv_file,
          sp.language_skills,
          sp.programming_skills,
          sp.other_skills,
          CASE 
            WHEN $1 = sp.user_id THEN sp.phone
            ELSE NULL
          END as phone,
          CASE 
            WHEN $1 = sp.user_id THEN sp.address
            ELSE NULL
          END as address,
          u.email,
          u.name,
          u.profile_image,
          u.department,
          u.faculty as user_faculty
        FROM student_profiles sp
        JOIN users u ON sp.user_id = u.id
        WHERE sp.id = $2`,
        [session.user.id, studentProfileId]
      ),

      // Education History
      query(
        `SELECT 
          id,
          school_name,
          degree,
          field_of_study,
          start_date,
          end_date,
          description
        FROM student_educations
        WHERE student_profile_id = $1
          AND is_public = true
        ORDER BY start_date DESC`,
        [studentProfileId]
      ),

      // Experience History
      query(
        `SELECT 
          id,
          company_name,
          position,
          start_date,
          end_date,
          description
        FROM student_experiences
        WHERE student_profile_id = $1
          AND is_public = true
        ORDER BY start_date DESC`,
        [studentProfileId]
      ),

      // Awards
      query(
        `SELECT 
          id,
          title,
          issuer,
          date_received,
          description
        FROM student_awards
        WHERE student_profile_id = $1
          AND is_public = true
        ORDER BY date_received DESC`,
        [studentProfileId]
      )
    ]);

    // 4. Error Handling
    if (!profileResult.rows.length) {
      return NextResponse.json(
        { error: 'Student profile not found' },
        { status: 404 }
      );
    }

    // 5. Data Privacy Protection
    const isOwnProfile = profileResult.rows[0].user_id === session.user.id;
    const profile = profileResult.rows[0];

    // 6. Response Construction
    const response = {
      ...profile,
      education: educationResult.rows,
      experience: experienceResult.rows,
      awards: awardsResult.rows,
      // Add metadata for frontend handling
      metadata: {
        isOwnProfile,
        lastUpdated: new Date().toISOString(),
        accessLevel: session.user.role
      }
    };

    // 7. Return Response
    return NextResponse.json(response);
    
  } catch (error) {
    // 8. Error Logging and Handling
    console.error('Failed to fetch student profile:', error);
    return NextResponse.json(
      { 
        error: 'An error occurred while fetching the profile',
        code: 'PROFILE_FETCH_ERROR'
      },
      { status: 500 }
    );
  }
}