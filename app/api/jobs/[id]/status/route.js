// app/api/jobs/[id]/status/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/db/queries';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';

// export async function PATCH(request, { params }) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

//     const jobId = params.id;
//     const { status } = await request.json();

//     // อัพเดทสถานะงาน
//     await query(
//       'UPDATE job_posts SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3',
//       [status, jobId, session.user.id]
//     );

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error('Error:', error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

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