// app/api/admin/faculties/update-faculty-name/route.js - เพิ่ม API ใหม่สำหรับอัพเดทชื่อคณะในทุกตาราง
import { NextResponse } from 'next/server';
import { query } from '@/lib/db/queries';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { facultyId, newName } = await request.json();

    if (!facultyId || !newName) {
      return NextResponse.json(
        { error: 'รหัสคณะและชื่อใหม่ไม่สามารถเป็นค่าว่างได้' },
        { status: 400 }
      );
    }

    // เริ่ม transaction เพื่อให้มั่นใจว่าการอัพเดททั้งหมดจะสำเร็จหรือล้มเหลวพร้อมกัน
    await query('BEGIN');

    try {
      // 1. อัพเดทชื่อคณะในตาราง faculties_list
      const facultyResult = await query(
        `UPDATE faculties_list 
         SET name = $1, updated_at = NOW() 
         WHERE id = $2 
         RETURNING id, name, is_active`,
        [newName, facultyId]
      );

      if (facultyResult.rows.length === 0) {
        await query('ROLLBACK');
        return NextResponse.json(
          { error: 'ไม่พบคณะที่ระบุ' },
          { status: 404 }
        );
      }

      // 2. อัพเดทชื่อคณะในตาราง users
      const usersResult = await query(
        'UPDATE users SET faculty = $1 WHERE faculty_id = $2',
        [newName, facultyId]
      );

      // 3. อัพเดทชื่อคณะในตาราง student_profiles
      const studentResult = await query(
        'UPDATE student_profiles SET faculty = $1 WHERE faculty_id = $2',
        [newName, facultyId]
      );

      // ไม่ต้องอัพเดท job_posts เพราะใช้ foreign key เท่านั้น
      // ไม่ต้องอัพเดท employer_profiles เพราะไม่เกี่ยวข้องกับ faculty

      // Commit transaction
      await query('COMMIT');

      return NextResponse.json({
        message: 'อัพเดทชื่อคณะสำเร็จ',
        faculty: facultyResult.rows[0],
        updates: {
          users: usersResult.rowCount,
          students: studentResult.rowCount
        }
      });
    } catch (error) {
      // ถ้าเกิดข้อผิดพลาด ให้ rollback transaction
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error updating faculty name:', error);
    return NextResponse.json(
      { error: 'Failed to update faculty name' },
      { status: 500 }
    );
  }
}