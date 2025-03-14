// app/api/student/cv/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { query } from "@/lib/db/queries";

// GET - ดึงข้อมูล CV ทั้งหมดของผู้ใช้
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // ดึงข้อมูล CV ของผู้ใช้
    const result = await query(
      `SELECT id, filename, file_path, uploaded_at 
       FROM user_cvs 
       WHERE user_id = $1 
       ORDER BY uploaded_at DESC`,
      [userId]
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching CV data:", error);
    return NextResponse.json(
      { error: "Failed to fetch CV data" },
      { status: 500 }
    );
  }
}