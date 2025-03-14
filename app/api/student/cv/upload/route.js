// app/api/student/cv/upload/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { query } from "@/lib/db/queries";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// สร้าง handler สำหรับ POST request ที่รับไฟล์ CV
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const userIdStr = String(userId);
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // ตรวจสอบประเภทไฟล์
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    // ตรวจสอบขนาดไฟล์ (100MB)
    const MAX_SIZE = 100 * 1024 * 1024; // 100MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 100MB limit" },
        { status: 400 }
      );
    }

    // อ่านข้อมูลไฟล์
    const fileBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(fileBuffer);

    // สร้างชื่อไฟล์ที่ไม่ซ้ำกัน
    const originalFilename = file.name;
    const uniqueId = uuidv4();
    const fileExtension = path.extname(originalFilename);
    const uniqueFilename = `${uniqueId}${fileExtension}`;

    // สร้างโฟลเดอร์สำหรับเก็บไฟล์ CV - ต้องแปลง userId เป็น string
    const uploadsDir = path.join(process.cwd(), "uploads", "cvs", userIdStr);
    
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // บันทึกไฟล์
    const filePath = path.join(uploadsDir, uniqueFilename);
    await writeFile(filePath, buffer);

    // เก็บเส้นทางในฐานข้อมูลโดยใช้ UUID เป็นคีย์หลัก
    // ไม่ต้องเก็บเส้นทางเต็ม เก็บแค่ชื่อไฟล์ที่ไม่ซ้ำกัน
    const storedFilename = uniqueFilename;
    
    console.log('File saved to:', filePath);
    console.log('Storing in database as:', storedFilename);

    // ตรวจสอบว่าชื่อไฟล์นี้มีอยู่แล้วหรือไม่
    const existingCheck = await query(
      "SELECT id FROM user_cvs WHERE user_id = $1 AND filename = $2",
      [userId, originalFilename]
    );

    if (existingCheck.rows.length > 0) {
      // ถ้ามีไฟล์ชื่อเดียวกันอยู่แล้ว ให้อัพเดทแทน
      const result = await query(
        `UPDATE user_cvs 
         SET file_path = $1, uploaded_at = NOW() 
         WHERE user_id = $2 AND filename = $3 
         RETURNING id, filename, file_path, uploaded_at`,
        [storedFilename, userId, originalFilename]
      );

      return NextResponse.json(result.rows[0], { status: 200 });
    } else {
      // ถ้ายังไม่มีไฟล์ชื่อนี้ ให้เพิ่มใหม่
      const result = await query(
        `INSERT INTO user_cvs (user_id, filename, file_path) 
         VALUES ($1, $2, $3) 
         RETURNING id, filename, file_path, uploaded_at`,
        [userId, originalFilename, storedFilename]
      );

      return NextResponse.json(result.rows[0], { status: 201 });
    }
  } catch (error) {
    console.error("Error uploading CV:", error);
    return NextResponse.json(
      { error: "Failed to upload CV: " + error.message },
      { status: 500 }
    );
  }
}