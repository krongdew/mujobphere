// app/api/student/cv/[id]/download/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { query } from "@/lib/db/queries";
import { readFile } from "fs/promises";
import path from "path";
import fs from 'fs';

// GET - ดาวน์โหลดไฟล์ CV
export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const userRole = session.user.role || 'user';
    const cvId = params.id;

    // ดึงข้อมูล CV เพื่อตรวจสอบว่ามีสิทธิ์เข้าถึงหรือไม่
    // เจ้าของ CV, admin, และบริษัทมีสิทธิ์ดาวน์โหลด
    const cvResult = await query(
      "SELECT id, user_id, filename, file_path FROM user_cvs WHERE id = $1",
      [cvId]
    );

    if (cvResult.rows.length === 0) {
      return NextResponse.json(
        { error: "CV not found" },
        { status: 404 }
      );
    }

    const cvOwnerUserId = cvResult.rows[0].user_id;
    
    // ตรวจสอบสิทธิ์การเข้าถึง
    // 1. เจ้าของ CV
    // 2. Admin
    // 3. บริษัท (company role)
    if (userId !== cvOwnerUserId && userRole !== 'admin' &&  userRole !== 'employer' && userRole !== 'employeroutside') {
      return NextResponse.json(
        { error: "Unauthorized to download this CV" },
        { status: 403 }
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
      return NextResponse.json(
        { error: "Invalid file path format" },
        { status: 500 }
      );
    }
    
    const filename = match[1];
    const userIdStr = String(cvOwnerUserId);
    
    // สร้างเส้นทางไฟล์ที่ถูกต้อง
    const filePath = path.join(process.cwd(), 'uploads', 'cvs', userIdStr, filename);

    console.log('Attempting to read file from:', filePath);
    
    // ตรวจสอบว่าไฟล์มีอยู่จริงหรือไม่
    if (!fs.existsSync(filePath)) {
      console.error('File does not exist:', filePath);
      
      // แสดงรายการไฟล์ในโฟลเดอร์
      const dirPath = path.join(process.cwd(), 'uploads', 'cvs', userIdStr);
      if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath);
        console.log('Files in directory:', files);
      } else {
        console.log('Directory does not exist:', dirPath);
      }
      
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }
    
    // อ่านไฟล์
    const fileBuffer = await readFile(filePath);

    // สร้าง Response ที่มีไฟล์
    const response = new NextResponse(fileBuffer);
    response.headers.set("Content-Type", "application/pdf");
    response.headers.set(
      "Content-Disposition",
      `attachment; filename=${encodeURIComponent(cvResult.rows[0].filename)}`
    );

    return response;
  } catch (error) {
    console.error("Error downloading CV:", error);
    return NextResponse.json(
      { error: "Failed to download CV: " + error.message },
      { status: 500 }
    );
  }
}