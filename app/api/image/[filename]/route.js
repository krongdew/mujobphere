import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(request, { params }) {
    try {
        // รับชื่อไฟล์จาก params
        const { filename } = params;
        
        // สร้าง path ไปยังไฟล์
        const filePath = join(process.cwd(), 'public', 'uploads', filename);
        
        // อ่านไฟล์
        const file = await readFile(filePath);
        
        // ตรวจสอบ file extension
        const ext = filename.split('.').pop().toLowerCase();
        const contentType = ext === 'png' ? 'image/png' : 
                          ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 
                          'application/octet-stream';

        // ส่งไฟล์กลับ
        return new NextResponse(file, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000'
            }
        });
    } catch (error) {
        console.error('Error reading image:', error);
        return new NextResponse('Image not found', { status: 404 });
    }
}