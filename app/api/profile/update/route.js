// app/api/profile/update/route.js
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";
import { query } from "@/lib/db/queries";
import { encrypt, decrypt } from "@/lib/security/encryption";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requestData = await request.json();
    const { userId, role, name, ...otherData } = requestData;

    if (session.user.id.toString() !== userId.toString()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== role) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // อัพเดทชื่อในตาราง users
    const updateUserQuery = `
      UPDATE users 
      SET name = $1
      WHERE id = $2
      RETURNING id, email, name, profile_image, department, faculty
    `;
    const userResult = await query(updateUserQuery, [name, userId]);

    let updateProfileQuery;
    let queryParams;

    if (role === 'employeroutside') {
      updateProfileQuery = `
        UPDATE employer_outside_profiles 
        SET 
          company_name = $1,
          company_address = $2,
          company_description = $3,
          company_phone = $4,
          contact_first_name = $5,
          contact_last_name = $6,
          contact_phone = $7,
          company_email = $8,
          company_benefits = $9,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $10
        RETURNING *
      `;
      queryParams = [
        otherData.company_name,
        otherData.company_address,
        otherData.company_description || null,
        otherData.company_phone ? encrypt(otherData.company_phone) : null,
        otherData.contact_first_name,
        otherData.contact_last_name,
        otherData.contact_phone ? encrypt(otherData.contact_phone) : null,
        otherData.company_email,
        otherData.company_benefits || null,
        userId
      ];
    } else if (role === 'employer') {
      updateProfileQuery = `
        UPDATE employer_profiles 
        SET 
          title = $1,
          department = $2,
          faculty = $3,
          position = $4,
          phone = $5,
          mobile_phone = $6,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $7
        RETURNING *
      `;
      queryParams = [
        otherData.title,
        otherData.department,
        otherData.faculty,
        otherData.position,
        otherData.phone ? encrypt(otherData.phone) : null,
        otherData.mobile_phone ? encrypt(otherData.mobile_phone) : null,
        userId
      ];
    } else {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const profileResult = await query(updateProfileQuery, queryParams);
    
    if (!profileResult.rows.length) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Decrypt phone numbers before sending response
    const profileData = { ...profileResult.rows[0] };
    if (profileData.mobile_phone) {
      try {
        profileData.mobile_phone = decrypt(profileData.mobile_phone);
      } catch (error) {
        console.error('Failed to decrypt mobile_phone:', error);
      }
    }
    if (profileData.phone) {
      try {
        profileData.phone = decrypt(profileData.phone);
      } catch (error) {
        console.error('Failed to decrypt phone:', error);
      }
    }
    if (profileData.company_phone) {
      try {
        profileData.company_phone = decrypt(profileData.company_phone);
      } catch (error) {
        console.error('Failed to decrypt company_phone:', error);
      }
    }
    if (profileData.contact_phone) {
      try {
        profileData.contact_phone = decrypt(profileData.contact_phone);
      } catch (error) {
        console.error('Failed to decrypt contact_phone:', error);
      }
    }

    return NextResponse.json({
      ...userResult.rows[0],
      ...profileData
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}