// app/api/student/applications/[applicationId]/route.js
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { query } from "@/lib/db/queries";

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { applicationId } = params;
    console.log('Attempting to delete application:', applicationId);

    // Verify the application belongs to this student
    const studentProfileResult = await query(
      'SELECT id FROM student_profiles WHERE user_id = $1',
      [session.user.id]
    );

    if (!studentProfileResult.rows.length) {
      console.log('Student profile not found for user:', session.user.id);
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    const studentProfileId = studentProfileResult.rows[0].id;

    // Check if the application exists and belongs to the student
    const verifyResult = await query(`
      SELECT id FROM job_applications 
      WHERE id = $1 AND student_profile_id = $2
    `, [applicationId, studentProfileId]);

    if (!verifyResult.rows.length) {
      console.log('Application not found or does not belong to student:', { applicationId, studentProfileId });
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Delete the application
    console.log('Deleting application:', applicationId);
    await query('DELETE FROM job_applications WHERE id = $1', [applicationId]);

    console.log('Application deleted successfully');
    return new NextResponse(null, { status: 204 });

  } catch (error) {
    console.error('Error deleting application:', error);
    return NextResponse.json(
      { error: 'Failed to delete application: ' + error.message },
      { status: 500 }
    );
  }
}