// // app/api/admin/faculties/[id]/route.js
// import { NextResponse } from 'next/server';
// import { query } from '@/lib/db/queries';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '../../../auth/[...nextauth]/route';

// export async function GET(request, { params }) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session || session.user.role !== 'admin') {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const { id } = params;

//     const result = await query(
//       `SELECT id, name, is_active, created_at, updated_at 
//        FROM faculties_list 
//        WHERE id = $1`,
//       [id]
//     );

//     if (result.rows.length === 0) {
//       return NextResponse.json(
//         { error: 'ไม่พบคณะที่ระบุ' },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json(result.rows[0]);
//   } catch (error) {
//     console.error('Error fetching faculty:', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch faculty' },
//       { status: 500 }
//     );
//   }
// }

// export async function PATCH(request, { params }) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session || session.user.role !== 'admin') {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const { id } = params;
//     const { name, is_active } = await request.json();

//     // Validate input
//     if (!name) {
//       return NextResponse.json(
//         { error: 'ชื่อคณะไม่สามารถเป็นค่าว่างได้' },
//         { status: 400 }
//       );
//     }

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

//     // Check if name already exists for another faculty
//     const duplicateResult = await query(
//       'SELECT id FROM faculties_list WHERE name = $1 AND id != $2',
//       [name, id]
//     );

//     if (duplicateResult.rows.length > 0) {
//       return NextResponse.json(
//         { error: 'ชื่อคณะนี้มีอยู่แล้ว' },
//         { status: 400 }
//       );
//     }

//     // Update faculty
//     const now = new Date();
//     const result = await query(
//       `UPDATE faculties_list 
//        SET name = $1, is_active = $2, updated_at = $3 
//        WHERE id = $4 
//        RETURNING id, name, is_active, created_at, updated_at`,
//       [name, is_active !== false, now, id]
//     );

//     return NextResponse.json({
//       message: 'อัพเดทคณะสำเร็จ',
//       faculty: result.rows[0]
//     });
//   } catch (error) {
//     console.error('Error updating faculty:', error);
//     return NextResponse.json(
//       { error: 'Failed to update faculty' },
//       { status: 500 }
//     );
//   }
// }

// export async function DELETE(request, { params }) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session || session.user.role !== 'admin') {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const { id } = params;

//     // Check if faculty is being used in any user profiles
//     const userResult = await query(
//       'SELECT COUNT(*) FROM users WHERE faculty_id = $1',
//       [id]
//     );
    
//     // Check if faculty is being used in any job posts
//     const jobResult = await query(
//       'SELECT COUNT(*) FROM job_posts WHERE faculty_id = $1',
//       [id]
//     );

//     const usersCount = parseInt(userResult.rows[0].count);
//     const jobsCount = parseInt(jobResult.rows[0].count);

//     if (usersCount > 0 || jobsCount > 0) {
//       let errorMessage = 'ไม่สามารถลบคณะนี้ได้เนื่องจาก';
//       if (usersCount > 0 && jobsCount > 0) {
//         errorMessage += 'มีผู้ใช้และประกาศงานที่ใช้งานอยู่';
//       } else if (usersCount > 0) {
//         errorMessage += 'มีผู้ใช้ที่ใช้งานอยู่';
//       } else {
//         errorMessage += 'มีประกาศงานที่ใช้งานอยู่';
//       }
      
//       return NextResponse.json(
//         { error: errorMessage },
//         { status: 400 }
//       );
//     }

//     // Delete the faculty
//     await query(
//       'DELETE FROM faculties_list WHERE id = $1',
//       [id]
//     );

//     return NextResponse.json({
//       message: 'ลบคณะสำเร็จ'
//     });
//   } catch (error) {
//     console.error('Error deleting faculty:', error);
//     return NextResponse.json(
//       { error: 'Failed to delete faculty' },
//       { status: 500 }
//     );
//   }
// }

// app/api/admin/faculties/[id]/route.js - DELETE function

import { NextResponse } from 'next/server';
import { query } from '@/lib/db/queries';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // ตรวจสอบการใช้งานในตารางที่เกี่ยวข้อง
    const userResult = await query(
      'SELECT COUNT(*) FROM users WHERE faculty = $1',
      [id]
    );
    
    const studentResult = await query(
      'SELECT COUNT(*) FROM student_profiles WHERE faculty = $1',
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
      let errorMessage = 'ไม่สามารถลบคณะนี้ได้เนื่องจากมีการใช้งานอยู่ใน';
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

    // ลบคณะ
    await query('DELETE FROM faculties_list WHERE id = $1', [id]);

    return NextResponse.json({
      message: 'ลบคณะสำเร็จ'
    });
  } catch (error) {
    console.error('Error deleting faculty:', error);
    return NextResponse.json(
      { error: 'Failed to delete faculty' },
      { status: 500 }
    );
  }
}

// app/api/admin/faculties/[id]/route.js - PATCH function
// app/api/admin/faculties/[id]/route.js - PATCH function
export async function PATCH(request, { params }) {
    try {
      const session = await getServerSession(authOptions);
      if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  
      const { id } = params;
      const { name, is_active } = await request.json();
  
      if (!name) {
        return NextResponse.json(
          { error: 'ชื่อคณะไม่สามารถเป็นค่าว่างได้' },
          { status: 400 }
        );
      }
  
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
  
      // ตรวจสอบว่ามีชื่อซ้ำหรือไม่
      const duplicateResult = await query(
        'SELECT id FROM faculties_list WHERE name = $1 AND id <> $2',
        [name, id]
      );
  
      if (duplicateResult.rows.length > 0) {
        return NextResponse.json(
          { error: 'ชื่อคณะนี้มีอยู่แล้ว' },
          { status: 400 }
        );
      }
  
      // อัพเดทข้อมูลคณะ
      const now = new Date();
      const result = await query(
        `UPDATE faculties_list 
         SET name = $1, is_active = $2, updated_at = $3 
         WHERE id = $4 
         RETURNING id, name, is_active, created_at, updated_at`,
        [name, is_active !== false, now, id]
      );
  
      return NextResponse.json({
        message: 'อัพเดทคณะสำเร็จ',
        faculty: result.rows[0]
      });
    } catch (error) {
      console.error('Error updating faculty:', error);
      return NextResponse.json(
        { error: 'Failed to update faculty' },
        { status: 500 }
      );
    }
  }