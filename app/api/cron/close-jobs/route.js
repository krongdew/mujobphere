// app/api/cron/close-jobs/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/db/queries';

export async function GET() {
  try {
    await query(
      `UPDATE job_posts 
       SET status = 'closed', updated_at = CURRENT_TIMESTAMP
       WHERE status = 'published' 
       AND application_end_date < CURRENT_DATE`
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error closing expired jobs:', error);
    return NextResponse.json(
      { error: 'Failed to close expired jobs' },
      { status: 500 }
    );
  }
}

