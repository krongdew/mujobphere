// app/api/profile/[userId]/route.js
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
    
    if (session.user.id.toString() !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userQuery = `
      SELECT id, email, name, profile_image, department, faculty 
      FROM users 
      WHERE id = $1
    `;
    const userResult = await query(userQuery, [userId]);
    
    if (!userResult.rows.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userResult.rows[0];
    let profileQuery;
    if (session.user.role === 'employeroutside') {
      profileQuery = `
        SELECT 
          id, user_id, company_name, company_address, company_description,
          company_phone, contact_first_name, contact_last_name, contact_phone,
          company_email, company_benefits, company_logo, company_cover,
          created_at, updated_at
        FROM employer_outside_profiles 
        WHERE user_id = $1
      `;
    } else if (session.user.role === 'employer') {
      profileQuery = `
        SELECT 
          id, user_id, title, department, faculty, position,
          phone, mobile_phone, company_logo, company_cover,
          created_at, updated_at
        FROM employer_profiles 
        WHERE user_id = $1
      `;
    } else if (session.user.role === 'student') {
      profileQuery = `
          SELECT 
              id, user_id, student_id, first_name, last_name,
              faculty, major, gpa, birth_date, 
              img_student, student_card_image,  
              language_skills, programming_skills, cv_file, portfolio_file,
              phone, address, 
              created_at, updated_at
          FROM student_profiles 
          WHERE user_id = $1
      `;
  } else {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const profileResult = await query(profileQuery, [userId]);
    
    if (!profileResult.rows.length) {
      // สร้าง profile ใหม่ตาม role
      let createProfileQuery;
      if (session.user.role === 'student') {
        createProfileQuery = `
            INSERT INTO student_profiles (
                user_id,
                phone,
                address,
                img_student,        
                student_card_image,
                created_at
            ) VALUES ($1, NULL, NULL, NULL, NULL, CURRENT_TIMESTAMP)
            RETURNING *
        `;
    } else if (session.user.role === 'employeroutside') {
        createProfileQuery = `
          INSERT INTO employer_outside_profiles (
            user_id,
            created_at
          ) VALUES ($1, CURRENT_TIMESTAMP)
          RETURNING *
        `;
      } else if (session.user.role === 'employer') {
        createProfileQuery = `
          INSERT INTO employer_profiles (
            user_id,
            created_at
          ) VALUES ($1, CURRENT_TIMESTAMP)
          RETURNING *
        `;
      }
    
      const newProfile = await query(createProfileQuery, [userId]);
      
      return NextResponse.json({
        ...userData,
        ...newProfile.rows[0]
      });
    }

    // แยกฟังก์ชันสำหรับถอดรหัส
    const decryptPhoneNumber = (encrypted) => {
      if (!encrypted) return null;
      try {
        return decrypt(encrypted);
      } catch (error) {
        console.error('Decryption error:', error);
        return null;
      }
    };

    const profileData = { ...profileResult.rows[0] };

    // ถอดรหัสตาม role
    if (session.user.role === 'employeroutside') {
      profileData.company_phone = decryptPhoneNumber(profileData.company_phone);
      profileData.contact_phone = decryptPhoneNumber(profileData.contact_phone);
    } else {
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