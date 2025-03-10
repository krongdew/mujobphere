// app/api/admin/users/[userId]/route.js
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { query } from "@/lib/db/queries";

export const dynamic = 'force-dynamic';

// GET user by ID
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = params.userId;
    
    const userQuery = `
      SELECT id, email, name, role, approval_status, created_at, 
             department, faculty, profile_image
      FROM users 
      WHERE id = $1
    `;
    const userResult = await query(userQuery, [userId]);
    
    if (!userResult.rows.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(userResult.rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch user',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// PATCH update user
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = params.userId;
    const body = await request.json();
    const { email, name, role } = body;

    // Check if user exists
    const checkUserQuery = `SELECT id, role FROM users WHERE id = $1`;
    const checkUserResult = await query(checkUserQuery, [userId]);
    if (!checkUserResult.rows.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentUser = checkUserResult.rows[0];

    // If changing email, check if new email is already taken
    if (email) {
      const checkEmailQuery = `SELECT id FROM users WHERE email = $1 AND id != $2`;
      const checkEmailResult = await query(checkEmailQuery, [email, userId]);
      if (checkEmailResult.rows.length > 0) {
        return NextResponse.json({ error: 'อีเมลนี้ถูกใช้งานแล้ว' }, { status: 409 });
      }
    }

    // Update user
    const updateUserQuery = `
      UPDATE users 
      SET 
        email = COALESCE($1, email),
        name = COALESCE($2, name),
        role = COALESCE($3, role)
      WHERE id = $4
      RETURNING id, email, name, role, approval_status, created_at
    `;
    const updateUserResult = await query(updateUserQuery, [email, name, role, userId]);
    
    // If role changed, handle profile creation
    if (role && role !== currentUser.role) {
      // If new role is admin and profile doesn't exist
      if (role === 'admin') {
        const checkProfileQuery = `SELECT id FROM admin_profiles WHERE user_id = $1`;
        const profileResult = await query(checkProfileQuery, [userId]);
        
        if (!profileResult.rows.length) {
          const createProfileQuery = `
            INSERT INTO admin_profiles (
              user_id, access_level, created_at
            ) VALUES ($1, 'standard', CURRENT_TIMESTAMP)
            RETURNING id
          `;
          await query(createProfileQuery, [userId]);
        }
      } 
      // If new role is employeroutside and profile doesn't exist
      else if (role === 'employeroutside') {
        const checkProfileQuery = `SELECT id FROM employer_outside_profiles WHERE user_id = $1`;
        const profileResult = await query(checkProfileQuery, [userId]);
        
        if (!profileResult.rows.length) {
          const createProfileQuery = `
            INSERT INTO employer_outside_profiles (
              user_id, created_at
            ) VALUES ($1, CURRENT_TIMESTAMP)
            RETURNING id
          `;
          await query(createProfileQuery, [userId]);
        }
      }
      // If new role is employer and profile doesn't exist
      else if (role === 'employer') {
        const checkProfileQuery = `SELECT id FROM employer_profiles WHERE user_id = $1`;
        const profileResult = await query(checkProfileQuery, [userId]);
        
        if (!profileResult.rows.length) {
          const createProfileQuery = `
            INSERT INTO employer_profiles (
              user_id, created_at
            ) VALUES ($1, CURRENT_TIMESTAMP)
            RETURNING id
          `;
          await query(createProfileQuery, [userId]);
        }
      }
      // If new role is student and profile doesn't exist
      else if (role === 'student') {
        const checkProfileQuery = `SELECT id FROM student_profiles WHERE user_id = $1`;
        const profileResult = await query(checkProfileQuery, [userId]);
        
        if (!profileResult.rows.length) {
          const createProfileQuery = `
            INSERT INTO student_profiles (
              user_id, created_at
            ) VALUES ($1, CURRENT_TIMESTAMP)
            RETURNING id
          `;
          await query(createProfileQuery, [userId]);
        }
      }
    }

    return NextResponse.json(updateUserResult.rows[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update user',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// DELETE user
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
      // ลบข้อมูลที่เกี่ยวข้องก่อนลบผู้ใช้
      // 1. ลบข้อมูลที่เกี่ยวข้องตามบทบาทของผู้ใช้
      if (user.role === 'admin') {
        // ลบข้อมูลจากตาราง admin_profiles
        await query('DELETE FROM admin_profiles WHERE user_id = $1', [userId]);
      } 
      else if (user.role === 'employeroutside') {
        // สำหรับ employeroutside ต้องลบข้อมูลทั้งหมดที่เกี่ยวข้องก่อน
        
        // 1. ลบงานทั้งหมดที่เกี่ยวข้องกับนายจ้าง
        // 1.1 หา employer_profile_id ก่อน
        const profileQuery = 'SELECT id FROM employer_outside_profiles WHERE user_id = $1';
        const profileResult = await query(profileQuery, [userId]);
        
        if (profileResult.rows.length > 0) {
          const profileId = profileResult.rows[0].id;
          
          // 1.2 ลบข้อมูลการสมัครงานที่เกี่ยวข้องกับงานของนายจ้างนี้
          await query(`
            DELETE FROM job_applications 
            WHERE job_id IN (
              SELECT id FROM jobs WHERE employer_outside_profile_id = $1
            )
          `, [profileId]);
          
          // 1.3 ลบงานทั้งหมดที่เกี่ยวข้องกับนายจ้างนี้
          await query('DELETE FROM jobs WHERE employer_outside_profile_id = $1', [profileId]);
        }
        
        // 2. ลบโปรไฟล์ของนายจ้าง
        await query('DELETE FROM employer_outside_profiles WHERE user_id = $1', [userId]);
      } 
      else if (user.role === 'employer') {
        // สำหรับ employer ต้องลบข้อมูลทั้งหมดที่เกี่ยวข้องก่อน
        
        // 1. ลบงานทั้งหมดที่เกี่ยวข้องกับนายจ้าง
        // 1.1 หา employer_profile_id ก่อน
        const profileQuery = 'SELECT id FROM employer_profiles WHERE user_id = $1';
        const profileResult = await query(profileQuery, [userId]);
        
        if (profileResult.rows.length > 0) {
          const profileId = profileResult.rows[0].id;
          
          // 1.2 ลบข้อมูลการสมัครงานที่เกี่ยวข้องกับงานของนายจ้างนี้
          await query(`
            DELETE FROM job_applications 
            WHERE job_id IN (
              SELECT id FROM jobs WHERE employer_profile_id = $1
            )
          `, [profileId]);
          
          // 1.3 ลบงานทั้งหมดที่เกี่ยวข้องกับนายจ้างนี้
          await query('DELETE FROM jobs WHERE employer_profile_id = $1', [profileId]);
        }
        
        // 2. ลบโปรไฟล์ของนายจ้าง
        await query('DELETE FROM employer_profiles WHERE user_id = $1', [userId]);
      } 
      else if (user.role === 'student') {
        // สำหรับ student ต้องลบข้อมูลทั้งหมดที่เกี่ยวข้องก่อน
        
        // 1. ลบข้อมูลการสมัครงานของนักศึกษา
        await query(`
          DELETE FROM job_applications 
          WHERE student_profile_id IN (
            SELECT id FROM student_profiles WHERE user_id = $1
          )
        `, [userId]);
        
        // 2. ลบโปรไฟล์ของนักศึกษา
        await query('DELETE FROM student_profiles WHERE user_id = $1', [userId]);
      }
      
      // ลบข้อมูลอื่นๆ ที่อาจเกี่ยวข้องกับ users
      // ตัวอย่าง:
      // await query('DELETE FROM user_notifications WHERE user_id = $1', [userId]);
      // await query('DELETE FROM user_logs WHERE user_id = $1', [userId]);
      
      // สุดท้ายลบข้อมูลผู้ใช้
      const deleteUserQuery = `DELETE FROM users WHERE id = $1`;
      await query(deleteUserQuery, [userId]);
      
      // Commit the transaction
      await query('COMMIT');
      
      return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error) {
      // Rollback on error
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error deleting user:', error);
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