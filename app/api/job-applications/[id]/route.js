// app/api/job-applications/[id]/route.js
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { query } from "@/lib/db/queries";

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || 
        (session.user.role !== 'employer' && session.user.role !== 'employeroutside')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { status } = await request.json();

    console.log('Updating application:', { id, status }); // Debug log

    // Verify the application belongs to one of this employer's job posts
    const verifyQuery = `
      SELECT ja.id 
      FROM job_applications ja
      JOIN job_posts jp ON ja.job_post_id = jp.id
      WHERE ja.id = $1 AND jp.user_id = $2
    `;
    const verifyResult = await query(verifyQuery, [id, session.user.id]);
    
    if (!verifyResult.rows.length) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Update application status
    let updateFields = [];
    let queryParams = [];
    let paramCount = 1;

    // Set status
    updateFields.push(`status = $${paramCount}`);
    queryParams.push(status);
    paramCount++;

    // Set timestamp based on status
    if (status === 'approved') {
      updateFields.push(`shortlisted_at = CURRENT_TIMESTAMP`);
    } else if (status === 'rejected') {
      updateFields.push(`rejected_at = CURRENT_TIMESTAMP`);
    }

    // Always update updated_at
    updateFields.push('updated_at = CURRENT_TIMESTAMP');

    const updateQuery = `
      UPDATE job_applications 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    queryParams.push(id);

    console.log('Update query:', updateQuery); // Debug log
    console.log('Query params:', queryParams); // Debug log

    const result = await query(updateQuery, queryParams);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
    }

    return NextResponse.json(result.rows[0]);

  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json(
      { error: 'Failed to update application: ' + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || 
        (session.user.role !== 'employer' && session.user.role !== 'employeroutside')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Verify the application belongs to one of this employer's job posts
    const verifyQuery = `
      SELECT ja.id 
      FROM job_applications ja
      JOIN job_posts jp ON ja.job_post_id = jp.id
      WHERE ja.id = $1 AND jp.user_id = $2
    `;
    const verifyResult = await query(verifyQuery, [id, session.user.id]);
    
    if (!verifyResult.rows.length) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Delete the application
    await query('DELETE FROM job_applications WHERE id = $1', [id]);
    
    return new NextResponse(null, { status: 204 });

  } catch (error) {
    console.error('Error deleting application:', error);
    return NextResponse.json(
      { error: 'Failed to delete application: ' + error.message },
      { status: 500 }
    );
  }
}