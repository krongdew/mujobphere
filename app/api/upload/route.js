// // app/api/upload/route.js
// import { NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '@/app/api/auth/[...nextauth]/route';
// import { writeFile } from 'fs/promises';
// import { join } from 'path';
// import { mkdir } from 'fs/promises';
// import { query } from '@/lib/db/queries';
// import { validateImageFile } from '@/lib/security/fileValidation';
// import crypto from 'crypto';

// // Generate safe filename function
// const generateSafeFileName = (originalName) => {
//     const ext = originalName.split('.').pop().toLowerCase();
//     const timestamp = Date.now();
//     const randomString = crypto.randomBytes(16).toString('hex');
//     return `${timestamp}_${randomString}.${ext}`;
//   };

// // เพิ่มฟังก์ชันสำหรับจัดการ path
// const getUploadPath = () => {
//   if (process.env.NODE_ENV === 'production') {
//     return '/opt/render/project/src/public/images/uploads';
//   }
//   return join(process.cwd(), 'public', 'images', 'uploads');
// };



// export async function POST(request) {
//   try {
//     console.log('Starting file upload process');

//     const session = await getServerSession(authOptions);
//     if (!session) {
//       return NextResponse.json(
//         { error: 'Unauthorized' },
//         { status: 401 }
//       );
//     }

//     const formData = await request.formData();
//     const file = formData.get('file');
//     const type = formData.get('type');

//     console.log('Received file:', {
//       fileName: file?.name,
//       fileType: file?.type,
//       fileSize: file?.size,
//       uploadType: type
//     });

//     if (!file) {
//       return NextResponse.json(
//         { error: 'No file uploaded' },
//         { status: 400 }
//       );
//     }

//     // Validate file
//     const validation = await validateImageFile(file);
//     if (!validation.isValid) {
//       return NextResponse.json(
//         { error: validation.error },
//         { status: 400 }
//       );
//     }

//     // ปรับการสร้าง path

//    // ใช้งาน
// const uploadDir = getUploadPath();
//    console.log('Creating directory:', uploadDir);
//    try {
//      await mkdir(uploadDir, { recursive: true });
//      console.log('Directory created or exists');
//    } catch (mkdirError) {
//      console.error('Error creating directory:', mkdirError);
//      throw mkdirError;
//    }

//     // Generate safe filename
//     const fileName = generateSafeFileName(file.name);
//      // บันทึกไฟล์พร้อม logging
//      const filePath = join(uploadDir, fileName);
//      console.log('Attempting to save file to:', filePath);
//      try {
//        const bytes = await file.arrayBuffer();
//        const buffer = Buffer.from(bytes);
//        await writeFile(filePath, buffer);
//        console.log('File saved successfully');
 
//        // ตรวจสอบว่าไฟล์ถูกสร้างจริงๆ
//        const stats = await stat(filePath);
//        console.log('File stats:', stats);
//      } catch (writeError) {
//        console.error('Error saving file:', writeError);
//        throw writeError;
//      }
//     // Important: Store the correct path in database
//     // Make sure the path starts with a leading slash
// // เปลี่ยน path ที่จะเก็บในฐานข้อมูล
// const dbFilePath = `/images/uploads/${fileName}`;

// // เพิ่ม console.log เพื่อดูค่า
// console.log('File saved to:', filePath);
// console.log('Database path:', dbFilePath);

//     let updateQuery;

//     try {
//       if (session.user.role === 'employeroutside') {
//         updateQuery = type === 'logo'
//           ? 'UPDATE employer_outside_profiles SET company_logo = $1 WHERE user_id = $2 RETURNING *'
//           : 'UPDATE employer_outside_profiles SET company_cover = $1 WHERE user_id = $2 RETURNING *';
//       } else {
//         updateQuery = type === 'logo'
//           ? 'UPDATE employer_profiles SET company_logo = $1 WHERE user_id = $2 RETURNING *'
//           : 'UPDATE employer_profiles SET company_cover = $1 WHERE user_id = $2 RETURNING *';
//       }
    
//       const result = await query(updateQuery, [dbFilePath, session.user.id]);
//       console.log('Database updated successfully:', result.rows[0]);
//     } catch (error) {
//       console.error('Database update error:', error);
//       throw error;
//     }
    
//     // ปรับ response ให้ส่งกลับ path ที่ถูกต้อง
//     return NextResponse.json({
//       url: dbFilePath,
//       message: 'File uploaded successfully'
//     });

//   } catch (error) {
//     console.error('Upload process error:', error);
//     // ส่ง error กลับไปให้ client ด้วย
//     return NextResponse.json(
//       { 
//         error: error.message,
//         stack: error.stack, // ในกรณี development
//         details: 'File upload failed'
//       },
//       { status: 500 }
//     );
//   }
// }

// app/api/upload/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { writeFile, chmod, stat } from 'fs/promises'; // เพิ่ม chmod, stat
import { join } from 'path';
import { mkdir } from 'fs/promises';
import { query } from '@/lib/db/queries';
import { validateImageFile } from '@/lib/security/fileValidation';
import crypto from 'crypto';

// Generate safe filename function
const generateSafeFileName = (originalName) => {
   const ext = originalName.split('.').pop().toLowerCase();
   const timestamp = Date.now();
   const randomString = crypto.randomBytes(16).toString('hex');
   return `${timestamp}_${randomString}.${ext}`;
};

// เพิ่มฟังก์ชันสำหรับจัดการ path
const getUploadPath = () => {
   if (process.env.NODE_ENV === 'production') {
       return '/opt/render/project/src/public/images/uploads';
   }
   return join(process.cwd(), 'public', 'images', 'uploads');
};

export async function POST(request) {
    try {
        console.log('Starting file upload process');
 
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }
 
        const formData = await request.formData();
        const file = formData.get('file');
        const type = formData.get('type');
 
       console.log('Received file:', {
           fileName: file?.name,
           fileType: file?.type,
           fileSize: file?.size,
           uploadType: type
       });

       if (!file) {
           return NextResponse.json(
               { error: 'No file uploaded' },
               { status: 400 }
           );
       }

       // Validate file
       const validation = await validateImageFile(file);
       if (!validation.isValid) {
           return NextResponse.json(
               { error: validation.error },
               { status: 400 }
           );
       }

        // ใช้งาน path (ประกาศครั้งเดียว)
        const uploadDir = getUploadPath();
        console.log('Creating directory:', uploadDir);
        try {
            // สร้างโฟลเดอร์พร้อมกำหนดสิทธิ์
            await mkdir(uploadDir, { recursive: true, mode: 0o755 });
            console.log('Directory created with permissions 755');
 
            // สร้างชื่อไฟล์
            const fileName = generateSafeFileName(file.name);
            const filePath = join(uploadDir, fileName);
 
            // บันทึกไฟล์
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            await writeFile(filePath, buffer);
            await chmod(filePath, 0o644);
 
            let updateQuery;
            if (session.user.role === 'employeroutside') {
                updateQuery = type === 'logo'
                    ? 'UPDATE employer_outside_profiles SET company_logo = $1 WHERE user_id = $2 RETURNING *'
                    : 'UPDATE employer_outside_profiles SET company_cover = $1 WHERE user_id = $2 RETURNING *';
            } else {
                updateQuery = type === 'logo'
                    ? 'UPDATE employer_profiles SET company_logo = $1 WHERE user_id = $2 RETURNING *'
                    : 'UPDATE employer_profiles SET company_cover = $1 WHERE user_id = $2 RETURNING *';
            }
 
            const result = await query(updateQuery, [fileName, session.user.id]);
            
            // ส่งกลับ URL ที่ถูกต้อง
            return NextResponse.json({
                url: `/images/uploads/${fileName}`,  // เปลี่ยนเป็นส่ง path เต็ม
                message: 'File uploaded successfully'
            });
 
        } catch (error) {
            console.error('Operation error:', error);
            throw error;
        }

 
    } catch (error) {
        console.error('Upload process error:', error);
        return NextResponse.json(
            {
                error: error.message,
                stack: error.stack,
                details: 'File upload failed'
            },
            { status: 500 }
        );
    }
 }