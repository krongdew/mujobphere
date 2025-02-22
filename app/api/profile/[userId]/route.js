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

    const profileData = { ...profileResult.rows[0] };

// แก้ไขส่วนการถอดรหัสให้มีการตรวจสอบก่อน
if (session.user.role === 'employeroutside') {
  if (profileData.company_phone) {
    profileData.company_phone = decrypt(profileData.company_phone);
  }
  if (profileData.contact_phone) {
    profileData.contact_phone = decrypt(profileData.contact_phone);
  }
} else if (session.user.role === 'student') {
  if (profileData.phone) {
    profileData.phone = decrypt(profileData.phone);
  }
  if (profileData.address) {
    profileData.address = decrypt(profileData.address);
  }
  if (profileData.birth_date) {
    profileData.birth_date = decrypt(profileData.birth_date);
  }
} else if (session.user.role === 'employer') {
  if (profileData.phone) {
    profileData.phone = decrypt(profileData.phone);
  }
  if (profileData.mobile_phone) {
    profileData.mobile_phone = decrypt(profileData.mobile_phone);
  }
}

    return NextResponse.json({
      ...userData,
      ...profileData
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    console.error('User role:', session.user.role);
    console.error('Profile data:', JSON.stringify(profileData, null, 2));
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch profile',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}