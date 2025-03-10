// app/api/admin/jobs/[id]/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/db/queries';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';


export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Admins can delete any job regardless of status
    // First delete related data to maintain referential integrity
    
    // Delete payment installments if they exist
    await query(
      'DELETE FROM job_payment_installments WHERE job_post_id = $1',
      [id]
    );

    // Delete job applications
    await query(
      'DELETE FROM job_applications WHERE job_post_id = $1',
      [id]
    );

    // Finally delete the job post
    await query(
      'DELETE FROM job_posts WHERE id = $1',
      [id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json(
      { error: 'ไม่สามารถลบประกาศรับสมัครงาน โปรดลองอีกครั้งในภายหลัง' },
      { status: 500 }
    );
  }
}

// app/api/admin/jobs/[id]/route.js - Add GET method for editing
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const jobId = params.id;
    
    // Get job details
    const jobResult = await query(
      'SELECT * FROM job_posts WHERE id = $1',
      [jobId]
    );

    if (!jobResult.rows.length) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const job = jobResult.rows[0];

    // Get employer details
    const employerResult = await query(
      'SELECT id, name, email FROM users WHERE id = $1',
      [job.user_id]
    );

    if (employerResult.rows.length) {
      job.employer = employerResult.rows[0];
    }

    if (job.payment_type === 'installment') {
      const installmentResult = await query(
        `SELECT amount, amount_type, installment_number
         FROM job_payment_installments
         WHERE job_post_id = $1
         ORDER BY installment_number`,
        [jobId]
      );

      job.payment_installments = installmentResult.rows;
      job.installment_count = installmentResult.rows.length || 2;
    } else {
      job.payment_installments = [];
      job.installment_count = 2;
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job details' },
      { status: 500 }
    );
  }
}