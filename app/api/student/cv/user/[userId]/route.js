// app/api/student/cv/user/[userId]/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { query } from "@/lib/db/queries";

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requestedUserId = parseInt(params.userId);
    const currentUserId = session.user.id;
    const userRole = session.user.role || 'user';
    
    // เช็คสิทธิ์: 
    // 1. เจ้าของโปรไฟล์ (นักศึกษาเจ้าของ CV)
    // 2. Admin
    // 3. บริษัท (company role) - เพิ่มให้บริษัทเห็น CV ของนักศึกษา
    if (requestedUserId !== currentUserId && userRole !== 'admin' && userRole !== 'employer' && userRole !== 'employeroutside') {
      return NextResponse.json({ error: "Unauthorized to access this user's CVs" }, { status: 403 });
    }

    // ดึงข้อมูล CV ของผู้ใช้ที่ระบุ
    const result = await query(
      `SELECT id, filename, file_path, uploaded_at 
       FROM user_cvs 
       WHERE user_id = $1 
       ORDER BY uploaded_at DESC`,
      [requestedUserId]
    );


    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching user CVs:", error);
    return NextResponse.json(
      { error: "Failed to fetch user CVs" },
      { status: 500 }
    );
  }
}