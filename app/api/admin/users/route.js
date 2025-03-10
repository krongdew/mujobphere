// app/api/admin/users/route.js
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { query } from "@/lib/db/queries";
import bcrypt from 'bcrypt';

export const dynamic = 'force-dynamic';

// GET all users with pagination
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const offset = (page - 1) * limit;

    // Get total count of users
    const countQuery = `SELECT COUNT(*) FROM users`;
    const countResult = await query(countQuery);
    const total = parseInt(countResult.rows[0].count);

    // Get users with pagination
    const usersQuery = `
      SELECT id, email, name, role, approval_status, created_at, 
             department, faculty, profile_image
      FROM users
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const usersResult = await query(usersQuery, [limit, offset]);

    return NextResponse.json({
      users: usersResult.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { 
        error: 'Failed to fetch users',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// POST create a new user
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { email, name, role, password } = body;

    // Check if email already exists
    const checkEmailQuery = `SELECT id FROM users WHERE email = $1`;
    const checkEmailResult = await query(checkEmailQuery, [email]);
    if (checkEmailResult.rows.length > 0) {
      return NextResponse.json({ error: 'อีเมลนี้ถูกใช้งานแล้ว' }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const createUserQuery = `
      INSERT INTO users (
        email, name, role, password, created_at
      ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      RETURNING id, email, name, role, created_at
    `;
    const createUserResult = await query(createUserQuery, [email, name, role, hashedPassword]);
    const newUser = createUserResult.rows[0];

    // If admin role, create admin profile
    if (role === 'admin') {
      const createAdminProfileQuery = `
        INSERT INTO admin_profiles (
          user_id, access_level, created_at
        ) VALUES ($1, 'standard', CURRENT_TIMESTAMP)
        RETURNING id
      `;
      await query(createAdminProfileQuery, [newUser.id]);
    } 
    // If employeroutside role, create employer outside profile
    else if (role === 'employeroutside') {
      const createEmployerProfileQuery = `
        INSERT INTO employer_outside_profiles (
          user_id, created_at
        ) VALUES ($1, CURRENT_TIMESTAMP)
        RETURNING id
      `;
      await query(createEmployerProfileQuery, [newUser.id]);
    }
    // If employer role, create employer profile
    else if (role === 'employer') {
      const createEmployerProfileQuery = `
        INSERT INTO employer_profiles (
          user_id, created_at
        ) VALUES ($1, CURRENT_TIMESTAMP)
        RETURNING id
      `;
      await query(createEmployerProfileQuery, [newUser.id]);
    }
    // If student role, create student profile
    else if (role === 'student') {
      const createStudentProfileQuery = `
        INSERT INTO student_profiles (
          user_id, created_at
        ) VALUES ($1, CURRENT_TIMESTAMP)
        RETURNING id
      `;
      await query(createStudentProfileQuery, [newUser.id]);
    }

    return NextResponse.json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create user',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}