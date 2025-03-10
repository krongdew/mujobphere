// app/api/admin/users/[userId]/approve/route.js
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { query } from "@/lib/db/queries";

export const dynamic = 'force-dynamic';

// PATCH update user approval status
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = params.userId;
    const body = await request.json();
    const { status, role } = body;

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    // Check if user exists
    const checkUserQuery = `SELECT id, role FROM users WHERE id = $1`;
    const checkUserResult = await query(checkUserQuery, [userId]);
    if (!checkUserResult.rows.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentUser = checkUserResult.rows[0];

    // Start a transaction
    await query('BEGIN');

    try {
      // Update user approval status
      const updateStatusQuery = `
        UPDATE users 
        SET 
          approval_status = $1, 
          approved_at = CURRENT_TIMESTAMP,
          approved_by = $2,
          role = COALESCE($3, role)
        WHERE id = $4
        RETURNING id, email, name, role, approval_status, created_at, approved_at, approved_by
      `;
      const updateStatusResult = await query(updateStatusQuery, [
        status, 
        session.user.id, 
        role, 
        userId
      ]);
      
      // If approving and changing role to employeroutside, create employer outside profile if it doesn't exist
      if (status === 'approved' && role === 'employeroutside') {
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

      // Commit the transaction
      await query('COMMIT');

      return NextResponse.json(updateStatusResult.rows[0]);
    } catch (error) {
      // Rollback the transaction in case of error
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error updating user approval status:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update user approval status',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}