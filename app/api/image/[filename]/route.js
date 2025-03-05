// app/api/image/[filename]/route.js
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
        
        // ถ้าไม่พบไฟล์ ให้ส่งไฟล์ default กลับไป
        try {
            const defaultFilePath = join(process.cwd(), 'public', 'images', 'default-company-logo.png');
            const defaultFile = await readFile(defaultFilePath);
            
            return new NextResponse(defaultFile, {
                headers: {
                    'Content-Type': 'image/png',
                    'Cache-Control': 'public, max-age=31536000'
                }
            });
        } catch (defaultError) {
            console.error('Error reading default image:', defaultError);
            return new NextResponse('Image not found', { status: 404 });
        }
    }
}