// app/api/profile/update/route.js
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";
import { query } from "@/lib/db/queries";
import { encrypt } from "@/lib/security/encryption";

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
      // เข้ารหัสข้อมูลที่จำเป็นสำหรับ employeroutside
      const sensitiveData = {
        company_phone: otherData.company_phone ? encrypt(otherData.company_phone) : null,
        contact_phone: otherData.contact_phone ? encrypt(otherData.contact_phone) : null
      };

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
        sensitiveData.company_phone,
        otherData.contact_first_name,
        otherData.contact_last_name,
        sensitiveData.contact_phone,
        otherData.company_email,
        otherData.company_benefits || null,
        userId
      ];

    } else if (role === 'employer') {
      // เข้ารหัสข้อมูลที่จำเป็นสำหรับ employer
      const sensitiveData = {
        phone: otherData.phone ? encrypt(otherData.phone) : null,
        mobile_phone: otherData.mobile_phone ? encrypt(otherData.mobile_phone) : null
      };

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
        sensitiveData.phone,
        sensitiveData.mobile_phone,
        userId
      ];

    } else if (role === 'student') {
      // เข้ารหัสข้อมูลที่จำเป็นสำหรับ student
      const sensitiveData = {
        phone: otherData.phone ? encrypt(otherData.phone) : null,
        address: otherData.address ? encrypt(otherData.address) : null,
        birth_date: otherData.birth_date ? encrypt(otherData.birth_date) : null
      };

      updateProfileQuery = `
        UPDATE student_profiles 
        SET 
          student_id = $1,
          first_name = $2,
          last_name = $3,
          faculty = $4,
          major = $5,
          gpa = $6,
          birth_date = $7,
          student_card_image = $8,
          language_skills = $9,
          programming_skills = $10,
          phone = $11,
          address = $12,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $13
        RETURNING *
      `;
      queryParams = [
        otherData.student_id,
        otherData.first_name,
        otherData.last_name,
        otherData.faculty,
        otherData.major,
        otherData.gpa || null,
        sensitiveData.birth_date,
        otherData.student_card_image || null,
        otherData.language_skills || null,
        otherData.programming_skills || null,
        sensitiveData.phone,
        sensitiveData.address,
        userId
      ];
    } else {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    console.log('Executing query with params:', queryParams);
    const profileResult = await query(updateProfileQuery, queryParams);
    
    if (!profileResult.rows.length) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // ส่งข้อมูลดิบกลับไป
    return NextResponse.json({
      ...userResult.rows[0],
      ...otherData,  // ใช้ข้อมูลดิบที่ยังไม่ได้เข้ารหัส
      id: profileResult.rows[0].id,
      user_id: profileResult.rows[0].user_id,
      created_at: profileResult.rows[0].created_at,
      updated_at: profileResult.rows[0].updated_at
    });

  } catch (error) {
    console.error('Profile update error:', error);
    console.error('Full error:', {
      message: error.message,
      stack: error.stack
    });
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}