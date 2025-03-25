// app/api/student/cv/[id]/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { query } from "@/lib/db/queries";
import { unlink } from "fs/promises";
import path from "path";
import fs from 'fs';

// DELETE - ลบไฟล์ CV
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const userIdStr = String(userId);
    const cvId = params.id;

    // ดึงข้อมูล CV เพื่อตรวจสอบว่าเป็นของผู้ใช้นี้จริงหรือไม่
    const cvResult = await query(
      "SELECT id, filename, file_path FROM user_cvs WHERE id = $1 AND user_id = $2",
      [cvId, userId]
    );

    if (cvResult.rows.length === 0) {
      return NextResponse.json(
        { error: "CV not found or not authorized" },
        { status: 404 }
      );
    }

    // แสดงข้อมูลเส้นทางที่เก็บในฐานข้อมูล
    console.log('Original stored path:', cvResult.rows[0].file_path);
    
    // ใช้ regex เพื่อหาชื่อไฟล์ที่มีรูปแบบเป็น UUID ตามด้วยนามสกุล .pdf
    const storedPath = cvResult.rows[0].file_path;
    const uuidPattern = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.pdf)/i;
    const match = storedPath.match(uuidPattern);
    
    if (!match) {
      console.error('Could not extract filename from path:', storedPath);
      // ยังคงลบข้อมูลในฐานข้อมูลแม้จะไม่สามารถลบไฟล์ได้
      await query("DELETE FROM user_cvs WHERE id = $1", [cvId]);
      return NextResponse.json({ success: true, warning: "Could not delete file but database record was removed" });
    }
    
    const filename = match[1];
    
    // สร้างเส้นทางไฟล์ที่ถูกต้อง
    const filePath = path.join(process.cwd(), 'uploads', 'cvs', userIdStr, filename);

    console.log('Attempting to delete file:', filePath);

    // ตรวจสอบว่าไฟล์มีอยู่จริงหรือไม่
    if (fs.existsSync(filePath)) {
      try {
        // ลบไฟล์
        await unlink(filePath);
        console.log('File deleted successfully:', filePath);
      } catch (fileError) {
        console.error("Error deleting file:", fileError);
        // ถ้าลบไฟล์ไม่สำเร็จ เรายังคงลบข้อมูลในฐานข้อมูล
      }
    } else {
      console.log('File does not exist:', filePath);
    }

    // ลบข้อมูล CV จากฐานข้อมูล
    await query("DELETE FROM user_cvs WHERE id = $1", [cvId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting CV:", error);
    return NextResponse.json(
      { error: "Failed to delete CV: " + error.message },
      { status: 500 }
    );
  }
}