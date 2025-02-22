// app/api/profile/public/[userId]/route.js
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { query } from "@/lib/db/queries";
import { decrypt } from "@/lib/security/encryption";

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

    // Function to decrypt phone numbers
    const decryptPhoneNumber = (encrypted) => {
      if (!encrypted) return null;
      try {
        return decrypt(encrypted);
      } catch (error) {
        console.error('Decryption error:', error);
        return null;
      }
    };

    // Return public data based on role
    let publicProfileQuery;
    if (userData.role === 'employeroutside') {
      publicProfileQuery = `
        SELECT 
          company_name, company_address, company_description,
          company_phone, contact_phone,
          company_benefits, company_logo, company_cover
        FROM employer_outside_profiles 
        WHERE user_id = $1
      `;
    } else if (userData.role === 'employer') {
      publicProfileQuery = `
        SELECT 
          title, department, faculty, position,
          phone, mobile_phone,
          company_logo, company_cover
        FROM employer_profiles 
        WHERE user_id = $1
      `;
    } else {
      return NextResponse.json({ error: 'Invalid role for job posting' }, { status: 400 });
    }

    const profileResult = await query(publicProfileQuery, [userId]);
    
    if (!profileResult.rows.length) {
      return NextResponse.json({
        ...userData
      });
    }

    const profileData = { ...profileResult.rows[0] };

    // Decrypt phone numbers based on role
    if (userData.role === 'employeroutside') {
      profileData.company_phone = decryptPhoneNumber(profileData.company_phone);
      profileData.contact_phone = decryptPhoneNumber(profileData.contact_phone);
    } else if (userData.role === 'employer') {
      profileData.phone = decryptPhoneNumber(profileData.phone);
      profileData.mobile_phone = decryptPhoneNumber(profileData.mobile_phone);
    }

    return NextResponse.json({
      ...userData,
      ...profileData
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}