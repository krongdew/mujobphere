// app/api/profile/public-noauth/[userId]/route.js
import { NextResponse } from "next/server";
import { query } from "@/lib/db/queries";
import { decrypt } from "@/lib/security/encryption";

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const userId = params.userId;
    
    // Get basic user data and role
    const userQuery = `
      SELECT id, name, role, profile_image 
      FROM users 
      WHERE id = $1
    `;
    const userResult = await query(userQuery, [userId]);
    
    if (!userResult.rows.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userResult.rows[0];

    // Return only public data based on role
    let publicProfileQuery;
    let publicFields = [];
    
    if (userData.role === 'employeroutside') {
      publicProfileQuery = `
        SELECT 
          company_name, company_logo
        FROM employer_outside_profiles 
        WHERE user_id = $1
      `;
      publicFields = ['company_name', 'company_logo'];
    } else if (userData.role === 'employer') {
      publicProfileQuery = `
        SELECT 
          department, faculty, company_logo
        FROM employer_profiles 
        WHERE user_id = $1
      `;
      publicFields = ['department', 'faculty', 'company_logo'];
    } else {
      // Return just basic user data for other roles
      return NextResponse.json({
        id: userData.id,
        name: userData.name,
        role: userData.role,
        profile_image: userData.profile_image
      });
    }

    const profileResult = await query(publicProfileQuery, [userId]);
    
    // If no profile exists, return just the basic user data
    if (!profileResult.rows.length) {
      return NextResponse.json({
        id: userData.id,
        name: userData.name,
        role: userData.role,
        profile_image: userData.profile_image
      });
    }

    // Include only the necessary public fields
    const publicProfileData = {};
    publicFields.forEach(field => {
      if (profileResult.rows[0][field] !== undefined) {
        publicProfileData[field] = profileResult.rows[0][field];
      }
    });

    // Return the combined data
    return NextResponse.json({
      id: userData.id,
      name: userData.name,
      role: userData.role,
      profile_image: userData.profile_image,
      ...publicProfileData
    });

  } catch (error) {
    console.error('Public profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}