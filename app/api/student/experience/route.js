// app/api/student/experience/route.js
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { query } from "@/lib/db/queries";

// Get all experiences for a student
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profileResult = await query(
      'SELECT id FROM student_profiles WHERE user_id = $1',
      [session.user.id]
    );

    if (!profileResult.rows.length) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    const studentProfileId = profileResult.rows[0].id;

    const result = await query(
      `SELECT * FROM student_experiences 
       WHERE student_profile_id = $1 
       ORDER BY start_date DESC`,
      [studentProfileId]
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch experiences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch experiences' },
      { status: 500 }
    );
  }
}

// Add new experience
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    const profileResult = await query(
      'SELECT id FROM student_profiles WHERE user_id = $1',
      [session.user.id]
    );

    if (!profileResult.rows.length) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    const studentProfileId = profileResult.rows[0].id;

    const result = await query(
      `INSERT INTO student_experiences (
        student_profile_id,
        company_name,
        position,
        start_date,
        end_date,
        description
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        studentProfileId,
        data.company_name,
        data.position,
        data.start_date,
        data.end_date,
        data.description
      ]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Failed to add experience:', error);
    return NextResponse.json(
      { error: 'Failed to add experience' },
      { status: 500 }
    );
  }
}

// Update experience
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { id } = data;

    const profileResult = await query(
      `SELECT se.* FROM student_experiences se
       JOIN student_profiles sp ON se.student_profile_id = sp.id
       WHERE se.id = $1 AND sp.user_id = $2`,
      [id, session.user.id]
    );

    if (!profileResult.rows.length) {
      return NextResponse.json({ error: 'Experience not found or unauthorized' }, { status: 404 });
    }

    const result = await query(
      `UPDATE student_experiences 
       SET 
        company_name = $1,
        position = $2,
        start_date = $3,
        end_date = $4,
        description = $5,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [
        data.company_name,
        data.position,
        data.start_date,
        data.end_date,
        data.description,
        id
      ]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Failed to update experience:', error);
    return NextResponse.json(
      { error: 'Failed to update experience' },
      { status: 500 }
    );
  }
}

// Delete experience
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { id } = data;

    const profileResult = await query(
      `SELECT se.* FROM student_experiences se
       JOIN student_profiles sp ON se.student_profile_id = sp.id
       WHERE se.id = $1 AND sp.user_id = $2`,
      [id, session.user.id]
    );

    if (!profileResult.rows.length) {
      return NextResponse.json({ error: 'Experience not found or unauthorized' }, { status: 404 });
    }

    await query('DELETE FROM student_experiences WHERE id = $1', [id]);

    return NextResponse.json({ message: 'Experience deleted successfully' });
  } catch (error) {
    console.error('Failed to delete experience:', error);
    return NextResponse.json(
      { error: 'Failed to delete experience' },
      { status: 500 }
    );
  }
}