// app/api/admin/users/[userId]/role/route.js
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { query } from "@/lib/db/queries";

export const dynamic = 'force-dynamic';

// PATCH update user role
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = params.userId;
    const body = await request.json();
    const { role } = body;

    if (!role) {
      return NextResponse.json({ error: 'Role is required' }, { status: 400 });
    }

    // Check if user exists and get current role
    const checkUserQuery = `SELECT id, role FROM users WHERE id = $1`;
    const checkUserResult = await query(checkUserQuery, [userId]);
    if (!checkUserResult.rows.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentUser = checkUserResult.rows[0];
    const currentRole = currentUser.role;

    // Update user role
    const updateRoleQuery = `
      UPDATE users 
      SET role = $1
      WHERE id = $2
      RETURNING id, email, name, role, approval_status, created_at
    `;
    const updateRoleResult = await query(updateRoleQuery, [role, userId]);
    
    // If role changed, handle profile creation based on the new role
    if (role !== currentRole) {
      // If new role is admin
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
      // If new role is employeroutside
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
      // If new role is employer
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
      // If new role is student
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

    return NextResponse.json(updateRoleResult.rows[0]);
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update user role',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}