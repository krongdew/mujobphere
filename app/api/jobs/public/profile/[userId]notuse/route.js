// app/api/profile/[userId]/route.js
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { query } from "@/lib/db/queries";

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = params.userId;
    
    // Get basic user data and role
    const userQuery = `
      SELECT id, email, name, role, profile_image, department, faculty 
      FROM users 
      WHERE id = $1
    `;
    const userResult = await query(userQuery, [userId]);
    
    if (!userResult.rows.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userResult.rows[0];

    // If user is accessing their own profile, return full data
    if (session.user.id.toString() === userId) {
      let profileQuery;
      if (userData.role === 'employeroutside') {
        profileQuery = `
          SELECT * FROM employer_outside_profiles WHERE user_id = $1
        `;
      } else if (userData.role === 'employer') {
        profileQuery = `
          SELECT * FROM employer_profiles WHERE user_id = $1
        `;
      } else if (userData.role === 'student') {
        profileQuery = `
          SELECT * FROM student_profiles WHERE user_id = $1
        `;
      }

      const profileResult = await query(profileQuery, [userId]);
      return NextResponse.json({
        ...userData,
        ...(profileResult.rows[0] || {})
      });
    }

    // For other users, return limited public data based on role
    let publicProfileQuery;
    if (userData.role === 'employeroutside') {
      publicProfileQuery = `
        SELECT 
          company_name, company_address, company_description,
          company_benefits, company_logo, company_cover
        FROM employer_outside_profiles 
        WHERE user_id = $1
      `;
    } else if (userData.role === 'employer') {
      publicProfileQuery = `
        SELECT 
          title, department, faculty, position,
          company_logo, company_cover
        FROM employer_profiles 
        WHERE user_id = $1
      `;
    } else {
      return NextResponse.json({ error: 'Invalid role for job posting' }, { status: 400 });
    }

    const profileResult = await query(publicProfileQuery, [userId]);
    
    return NextResponse.json({
      ...userData,
      ...(profileResult.rows[0] || {})
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}