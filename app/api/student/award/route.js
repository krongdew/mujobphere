// app/api/student/award/route.js
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { query } from "@/lib/db/queries";

// Get all awards for a student
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
      `SELECT * FROM student_awards 
       WHERE student_profile_id = $1 
       ORDER BY date_received DESC`,
      [studentProfileId]
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch awards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch awards' },
      { status: 500 }
    );
  }
}

// Add new award
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
      `INSERT INTO student_awards (
        student_profile_id,
        title,
        issuer,
        date_received,
        description
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [
        studentProfileId,
        data.title,
        data.issuer,
        data.date_received,
        data.description
      ]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Failed to add award:', error);
    return NextResponse.json(
      { error: 'Failed to add award' },
      { status: 500 }
    );
  }
}

// Update award
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
      `SELECT sa.* FROM student_awards sa
       JOIN student_profiles sp ON sa.student_profile_id = sp.id
       WHERE sa.id = $1 AND sp.user_id = $2`,
      [id, session.user.id]
    );

    if (!profileResult.rows.length) {
      return NextResponse.json({ error: 'Award not found or unauthorized' }, { status: 404 });
    }

    const result = await query(
      `UPDATE student_awards 
       SET 
        title = $1,
        issuer = $2,
        date_received = $3,
        description = $4,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [
        data.title,
        data.issuer,
        data.date_received,
        data.description,
        id
      ]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Failed to update award:', error);
    return NextResponse.json(
      { error: 'Failed to update award' },
      { status: 500 }
    );
  }
}

// Delete award
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
      `SELECT sa.* FROM student_awards sa
       JOIN student_profiles sp ON sa.student_profile_id = sp.id
       WHERE sa.id = $1 AND sp.user_id = $2`,
      [id, session.user.id]
    );

    if (!profileResult.rows.length) {
      return NextResponse.json({ error: 'Award not found or unauthorized' }, { status: 404 });
    }

    await query('DELETE FROM student_awards WHERE id = $1', [id]);

    return NextResponse.json({ message: 'Award deleted successfully' });
  } catch (error) {
    console.error('Failed to delete award:', error);
    return NextResponse.json(
      { error: 'Failed to delete award' },
      { status: 500 }
    );
  }
}