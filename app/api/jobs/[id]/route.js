// app/api/jobs/[id]/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/db/queries';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const jobId = params.id;
    
    // ดึงข้อมูลงานพื้นฐานก่อน
    const jobResult = await query(
      'SELECT * FROM job_posts WHERE id = $1 AND user_id = $2',
      [jobId, session.user.id]
    );

    if (!jobResult.rows.length) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const job = jobResult.rows[0];

    // ถ้าเป็นการจ่ายแบบงวด ให้ดึงข้อมูลงวดการจ่ายเงิน
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

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const jobId = params.id;
    const data = await request.json();

    // Verify job belongs to user
    const jobResult = await query(
      'SELECT user_id FROM job_posts WHERE id = $1',
      [jobId]
    );

    if (!jobResult.rows.length || jobResult.rows[0].user_id !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update job post
    await query(
      `UPDATE job_posts SET
        hire_type = $1, job_type_id = $2, other_job_type = $3,
        title = $4, application_start_date = $5, application_end_date = $6,
        has_interview = $7, interview_details = $8, work_start_date = $9,
        work_end_date = $10, work_end_indefinite = $11, work_time_start = $12,
        work_time_end = $13, is_online = $14, location = $15, compensation_amount = $16,
        compensation_period = $17, compensation_other = $18, project_description = $19,
        job_description = $20, education_level = $21, additional_requirements = $22,
        preferred_faculty_id = $23, payment_type = $24, updated_at = CURRENT_TIMESTAMP
      WHERE id = $25`,
      [
        data.hire_type, data.job_type_id, data.other_job_type,
        data.title, data.application_start_date, data.application_end_date,
        data.has_interview, data.interview_details, data.work_start_date,
        data.work_end_date, data.work_end_indefinite, data.work_time_start,
        data.work_time_end, data.is_online, data.location, data.compensation_amount,
        data.compensation_period, data.compensation_other, data.project_description,
        data.job_description, data.education_level, data.additional_requirements,
        data.preferred_faculty_id, data.payment_type, jobId
      ]
    );

    // Handle payment installments
    if (data.payment_type === 'installment' && Array.isArray(data.payment_installments)) {
      // Delete existing installments
      await query(
        'DELETE FROM job_payment_installments WHERE job_post_id = $1',
        [jobId]
      );

      // Insert new installments
      for (let i = 0; i < data.payment_installments.length; i++) {
        const installment = data.payment_installments[i];
        if (installment?.amount && installment?.amount_type) {
          await query(
            `INSERT INTO job_payment_installments (
              job_post_id, installment_number, amount, amount_type
            ) VALUES ($1, $2, $3, $4)`,
            [
              jobId,
              i + 1,
              parseFloat(installment.amount),
              installment.amount_type
            ]
          );
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json(
      { error: 'Failed to update job' },
      { status: 500 }
    );
  }
}