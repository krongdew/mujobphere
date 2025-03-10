// app/api/admin/users/[userId]/direct-delete/route.js
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { query } from "@/lib/db/queries";

export const dynamic = 'force-dynamic';

// DELETE ลบผู้ใช้โดยตรงด้วย SQL ที่เฉพาะเจาะจง
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = params.userId;
    
    // Check if user exists
    const checkUserQuery = `SELECT id, role FROM users WHERE id = $1`;
    const checkUserResult = await query(checkUserQuery, [userId]);
    if (!checkUserResult.rows.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = checkUserResult.rows[0];
    
    // Start a transaction
    await query('BEGIN');
    
    try {
      // เช็คและลบข้อมูลจากตาราง employer_outside_profiles ซึ่งตรงกับข้อความผิดพลาด
      console.log(`[DELETE] Focusing on employer_outside_profiles for user ${userId}`);
      
      // 1. ลบโปรไฟล์ทั้งหมดที่เกี่ยวข้องกับผู้ใช้นี้ (แยกคำสั่งเพื่อความชัดเจน)
      console.log(`[DELETE] Removing profiles for user ${userId} with role ${user.role}`);
      
      // ทดลองลบโปรไฟล์ของนายจ้างที่ทำให้เกิดปัญหา foreign key
      const deleteEmployerOutside = await query('DELETE FROM employer_outside_profiles WHERE user_id = $1 RETURNING id', [userId]);
      console.log(`[DELETE] Deleted ${deleteEmployerOutside.rowCount} records from employer_outside_profiles`);
      
      // ลบโปรไฟล์อื่นๆ ที่อาจมี
      const deleteAdminProfiles = await query('DELETE FROM admin_profiles WHERE user_id = $1 RETURNING id', [userId]);
      console.log(`[DELETE] Deleted ${deleteAdminProfiles.rowCount} records from admin_profiles`);
      
      const deleteEmployerProfiles = await query('DELETE FROM employer_profiles WHERE user_id = $1 RETURNING id', [userId]);
      console.log(`[DELETE] Deleted ${deleteEmployerProfiles.rowCount} records from employer_profiles`);
      
      const deleteStudentProfiles = await query('DELETE FROM student_profiles WHERE user_id = $1 RETURNING id', [userId]);
      console.log(`[DELETE] Deleted ${deleteStudentProfiles.rowCount} records from student_profiles`);
      
      // 2. ลบข้อมูลผู้ใช้จากตาราง users
      console.log(`[DELETE] Removing user ${userId}`);
      const deleteUserQuery = `DELETE FROM users WHERE id = $1 RETURNING id`;
      const deleteResult = await query(deleteUserQuery, [userId]);
      console.log(`[DELETE] Deleted ${deleteResult.rowCount} users with ID ${userId}`);
      
      // Commit the transaction
      await query('COMMIT');
      
      return NextResponse.json({ 
        message: 'User deleted successfully',
        userId: userId,
        deletedProfiles: {
          employer_outside: deleteEmployerOutside.rowCount,
          admin: deleteAdminProfiles.rowCount,
          employer: deleteEmployerProfiles.rowCount,
          student: deleteStudentProfiles.rowCount
        },
        deletedUsers: deleteResult.rowCount
      });
    } catch (error) {
      // Rollback on error
      await query('ROLLBACK');
      console.error('[DELETE TRANSACTION ERROR]', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in direct delete user:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete user',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}