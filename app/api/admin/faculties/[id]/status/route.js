// // app/api/admin/faculties/[id]/status/route.js
// import { NextResponse } from 'next/server';
// import { query } from '@/lib/db/queries';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '../../../../auth/[...nextauth]/route';

// export async function PATCH(request, { params }) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session || session.user.role !== 'admin') {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const { id } = params;
//     const { is_active } = await request.json();

//     // Check if faculty exists
//     const existingResult = await query(
//       'SELECT id FROM faculties_list WHERE id = $1',
//       [id]
//     );

//     if (existingResult.rows.length === 0) {
//       return NextResponse.json(
//         { error: 'ไม่พบคณะที่ระบุ' },
//         { status: 404 }
//       );
//     }

//     // If deactivating, check for dependencies
//     if (!is_active) {
//       // Check if faculty is being used in any user profiles
//       const userResult = await query(
//         'SELECT COUNT(*) FROM users WHERE faculty = $1',
//         [id]
//       );
      
//       // Check if faculty is being used in any job posts
//       const jobResult = await query(
//         'SELECT COUNT(*) FROM job_posts WHERE faculty = $1',
//         [id]
//       );

//       const usersCount = parseInt(userResult.rows[0].count);
//       const jobsCount = parseInt(jobResult.rows[0].count);

//       if (usersCount > 0 || jobsCount > 0) {
//         let errorMessage = 'ไม่สามารถปิดการใช้งานคณะนี้ได้เนื่องจาก';
//         if (usersCount > 0 && jobsCount > 0) {
//           errorMessage += 'มีผู้ใช้และประกาศงานที่ใช้งานอยู่';
//         } else if (usersCount > 0) {
//           errorMessage += 'มีผู้ใช้ที่ใช้งานอยู่';
//         } else {
//           errorMessage += 'มีประกาศงานที่ใช้งานอยู่';
//         }
        
//         return NextResponse.json(
//           { error: errorMessage },
//           { status: 400 }
//         );
//       }
//     }

//     // Update faculty status
//     const now = new Date();
//     const result = await query(
//       `UPDATE faculties_list 
//        SET is_active = $1, updated_at = $2 
//        WHERE id = $3 
//        RETURNING id, name, is_active, created_at, updated_at`,
//       [is_active, now, id]
//     );

//     return NextResponse.json({
//       message: `${is_active ? 'เปิด' : 'ปิด'}การใช้งานคณะสำเร็จ`,
//       faculty: result.rows[0]
//     });
//   } catch (error) {
//     console.error('Error updating faculty status:', error);
//     return NextResponse.json(
//       { error: 'Failed to update faculty status' },
//       { status: 500 }
//     );
//   }
// }
// app/api/admin/faculties/[id]/status/route.js - แก้ไขส่วน PATCH function
import { NextResponse } from 'next/server';
import { query } from '@/lib/db/queries';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../auth/[...nextauth]/route';
export async function PATCH(request, { params }) {
    try {
      const session = await getServerSession(authOptions);
      if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  
      const { id } = params;
      const { is_active } = await request.json();
  
      // ตรวจสอบว่าคณะมีอยู่จริง
      const existingResult = await query(
        'SELECT id FROM faculties_list WHERE id = $1',
        [id]
      );
  
      if (existingResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'ไม่พบคณะที่ระบุ' },
          { status: 404 }
        );
      }
  
      // ถ้ากำลังปิดใช้งาน ให้ตรวจสอบว่ามีการใช้งานอยู่หรือไม่
      if (!is_active) {
        const userResult = await query(
          'SELECT COUNT(*) FROM users WHERE faculty_id = $1',
          [id]
        );
        
        const studentResult = await query(
          'SELECT COUNT(*) FROM student_profiles WHERE faculty_id = $1',
          [id]
        );
        
        const jobResult = await query(
          'SELECT COUNT(*) FROM job_posts WHERE preferred_faculty_id = $1',
          [id]
        );
  
        const usersCount = parseInt(userResult.rows[0].count);
        const studentsCount = parseInt(studentResult.rows[0].count);
        const jobsCount = parseInt(jobResult.rows[0].count);
  
        if (usersCount > 0 || studentsCount > 0 || jobsCount > 0) {
          let errorMessage = 'ไม่สามารถปิดการใช้งานคณะนี้ได้เนื่องจากมีการใช้งานอยู่ใน';
          const usedIn = [];
          
          if (usersCount > 0) usedIn.push('ข้อมูลผู้ใช้');
          if (studentsCount > 0) usedIn.push('โปรไฟล์นักศึกษา');
          if (jobsCount > 0) usedIn.push('ประกาศงาน');
          
          errorMessage += ` ${usedIn.join(', ')}`;
          
          return NextResponse.json(
            { error: errorMessage },
            { status: 400 }
          );
        }
      }
  
      // อัพเดทสถานะคณะ
      const now = new Date();
      const result = await query(
        `UPDATE faculties_list 
         SET is_active = $1, updated_at = $2 
         WHERE id = $3 
         RETURNING id, name, is_active, created_at, updated_at`,
        [is_active, now, id]
      );
  
      return NextResponse.json({
        message: `${is_active ? 'เปิด' : 'ปิด'}การใช้งานคณะสำเร็จ`,
        faculty: result.rows[0]
      });
    } catch (error) {
      console.error('Error updating faculty status:', error);
      return NextResponse.json(
        { error: 'Failed to update faculty status' },
        { status: 500 }
      );
    }
  }