// app/api/jobs/employer/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/db/queries';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '6'; // Default to 6 months

    const result = await query(
      `SELECT 
        j.*,
        COUNT(DISTINCT a.id) as application_count
       FROM job_posts j
       LEFT JOIN job_applications a ON j.id = a.job_post_id
       WHERE j.user_id = $1
       AND j.created_at > CURRENT_DATE - INTERVAL '${period} months'
       GROUP BY j.id
       ORDER BY j.created_at DESC`,
      [session.user.id]
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}

// app/api/jobs/[id]/status/route.js
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { status } = await request.json();

    // Verify job belongs to user
    const jobResult = await query(
      'SELECT user_id FROM job_posts WHERE id = $1',
      [id]
    );

    if (!jobResult.rows.length || jobResult.rows[0].user_id !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await query(
      'UPDATE job_posts SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [status, id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating job status:', error);
    return NextResponse.json(
      { error: 'Failed to update job status' },
      { status: 500 }
    );
  }
}