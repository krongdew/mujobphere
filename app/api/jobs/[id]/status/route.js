// app/api/jobs/[id]/status/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/db/queries';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const jobId = params.id;
    const { status } = await request.json();

    // อัพเดทสถานะงาน
    await query(
      'UPDATE job_posts SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3',
      [status, jobId, session.user.id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}