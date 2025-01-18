// app/api/student/education/route.js
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { query } from "@/lib/db/queries";

// Get all educations for a student
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get student profile id
    const profileResult = await query(
      'SELECT id FROM student_profiles WHERE user_id = $1',
      [session.user.id]
    );

    if (!profileResult.rows.length) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    const studentProfileId = profileResult.rows[0].id;

    const result = await query(
      `SELECT * FROM student_educations 
       WHERE student_profile_id = $1 
       ORDER BY start_date DESC`,
      [studentProfileId]
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch educations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch educations' },
      { status: 500 }
    );
  }
}

// Add new education
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    // Get student profile id
    const profileResult = await query(
      'SELECT id FROM student_profiles WHERE user_id = $1',
      [session.user.id]
    );

    if (!profileResult.rows.length) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    const studentProfileId = profileResult.rows[0].id;

    const result = await query(
      `INSERT INTO student_educations (
        student_profile_id,
        school_name,
        degree,
        field_of_study,
        start_date,
        end_date,
        description
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        studentProfileId,
        data.school_name,
        data.degree,
        data.field_of_study,
        data.start_date,
        data.end_date,
        data.description
      ]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Failed to add education:', error);
    return NextResponse.json(
      { error: 'Failed to add education' },
      { status: 500 }
    );
  }
}

// app/api/student/education/[id]/route.js
// Update education
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { id } = data;

    // Verify ownership
    const profileResult = await query(
      `SELECT se.* FROM student_educations se
       JOIN student_profiles sp ON se.student_profile_id = sp.id
       WHERE se.id = $1 AND sp.user_id = $2`,
      [id, session.user.id]
    );

    if (!profileResult.rows.length) {
      return NextResponse.json({ error: 'Education not found or unauthorized' }, { status: 404 });
    }

    const result = await query(
      `UPDATE student_educations 
       SET 
        school_name = $1,
        degree = $2,
        field_of_study = $3,
        start_date = $4,
        end_date = $5,
        description = $6,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [
        data.school_name,
        data.degree,
        data.field_of_study,
        data.start_date,
        data.end_date,
        data.description,
        id
      ]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Failed to update education:', error);
    return NextResponse.json(
      { error: 'Failed to update education' },
      { status: 500 }
    );
  }
}

// Delete education
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { id } = data;

    // Verify ownership
    const profileResult = await query(
      `SELECT se.* FROM student_educations se
       JOIN student_profiles sp ON se.student_profile_id = sp.id
       WHERE se.id = $1 AND sp.user_id = $2`,
      [id, session.user.id]
    );

    if (!profileResult.rows.length) {
      return NextResponse.json({ error: 'Education not found or unauthorized' }, { status: 404 });
    }

    await query('DELETE FROM student_educations WHERE id = $1', [id]);

    return NextResponse.json({ message: 'Education deleted successfully' });
  } catch (error) {
    console.error('Failed to delete education:', error);
    return NextResponse.json(
      { error: 'Failed to delete education' },
      { status: 500 }
    );
  }
}