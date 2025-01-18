// app/api/student/resume/route.js
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { query } from "@/lib/db/queries";

// Get resume data
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await query(
      `SELECT description, programming_skills, language_skills, other_skills 
       FROM student_profiles 
       WHERE user_id = $1`,
      [session.user.id]
    );

    if (!result.rows.length) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Failed to fetch resume data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resume data' },
      { status: 500 }
    );
  }
}

// ใน route.js
export async function POST(request) {
    try {
      const session = await getServerSession(authOptions);
      if (!session || session.user.role !== 'student') {
        return NextResponse.json({ error: 'ไม่ได้รับอนุญาต' }, { status: 401 });
      }
  
      const data = await request.json();
  
      // แปลงข้อความให้ปลอดภัย
      const cleanData = {
        description: data.description ? 
          data.description.replace(/[^\u0E00-\u0E7Fa-zA-Z0-9\s]/g, '') : '',
        programming_skills: data.programming_skills ? 
          data.programming_skills.replace(/[^\u0E00-\u0E7Fa-zA-Z0-9\s]/g, '') : '',
        language_skills: data.language_skills ? 
          data.language_skills.replace(/[^\u0E00-\u0E7Fa-zA-Z0-9\s]/g, '') : '',
        other_skills: data.other_skills ? 
          data.other_skills.replace(/[^\u0E00-\u0E7Fa-zA-Z0-9\s]/g, '') : ''
      };
  
      const result = await query(
        `UPDATE student_profiles 
         SET 
          description = $1,
          programming_skills = $2,
          language_skills = $3,
          other_skills = $4,
          updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $5
         RETURNING *`,
        [
          cleanData.description,
          cleanData.programming_skills,
          cleanData.language_skills,
          cleanData.other_skills,
          session.user.id
        ]
      );
  
      if (!result.rows.length) {
        return NextResponse.json({ error: 'ไม่พบโปรไฟล์' }, { status: 404 });
      }
  
      return NextResponse.json(result.rows[0]);
    } catch (error) {
      console.error('รายละเอียดข้อผิดพลาด:', error);
      return NextResponse.json(
        { 
          error: 'ไม่สามารถบันทึกข้อมูลได้',
          รายละเอียด: error.message 
        }, 
        { status: 500 }
      );
    }
  }