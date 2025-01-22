// app/api/jobs/create/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/db/queries';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

// Helper function to convert empty strings or 0 to null
const sanitizeData = (data) => {
  const sanitized = { ...data };
  Object.keys(sanitized).forEach(key => {
    // Convert empty strings to null
    if (sanitized[key] === '') {
      sanitized[key] = null;
    }
    
    // Convert 0 to null for specific fields
    const fieldsToNullifyIfZero = [
      'preferred_faculty_id', 
      'job_type_id', 
      'compensation_amount'
    ];
    
    if (fieldsToNullifyIfZero.includes(key) && sanitized[key] === 0) {
      sanitized[key] = null;
    }
  });
  return sanitized;
};

// Validate required fields
const validateJobPostData = (data) => {
  const errors = [];

  // Add your validation rules here
  if (!data.title) errors.push('หัวข้องานต้องไม่เป็นค่าว่าง');
  if (!data.hire_type) errors.push('ประเภทการจ้างต้องระบุ');
  if (!data.job_description) errors.push('รายละเอียดงานต้องไม่เป็นค่าว่าง');

  return errors;
};

export async function POST(request) {
  try {
    // Verify user session
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'ไม่ได้รับอนุญาต' }, { status: 401 });
    }

    // Parse request data
    const data = await request.json();
    
    // Sanitize input data
    const sanitizedData = sanitizeData(data);

    // Validate data
    const validationErrors = validateJobPostData(sanitizedData);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          error: 'ข้อมูลไม่ถูกต้อง', 
          validationErrors 
        }, 
        { status: 400 }
      );
    }

    // Insert job post
    const jobResult = await query(
      `INSERT INTO job_posts (
        user_id, hire_type, job_type_id, other_job_type,
        title, application_start_date, application_end_date,
        has_interview, interview_details, work_start_date,
        work_end_date, work_end_indefinite, work_time_start,
        work_time_end, is_online, location, compensation_amount,
        compensation_period, compensation_other, project_description,
        job_description, education_level, additional_requirements,
        preferred_faculty_id, payment_type, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
               $11, $12, $13, $14, $15, $16, $17, $18, $19,
               $20, $21, $22, $23, $24, $25, $26)
      RETURNING id`,
      [
        session.user.id, 
        sanitizedData.hire_type, 
        sanitizedData.job_type_id, 
        sanitizedData.other_job_type,
        sanitizedData.title, 
        sanitizedData.application_start_date, 
        sanitizedData.application_end_date,
        sanitizedData.has_interview, 
        sanitizedData.interview_details, 
        sanitizedData.work_start_date,
        sanitizedData.work_end_date, 
        sanitizedData.work_end_indefinite, 
        sanitizedData.work_time_start,
        sanitizedData.work_time_end, 
        sanitizedData.is_online, 
        sanitizedData.location, 
        sanitizedData.compensation_amount,
        sanitizedData.compensation_period, 
        sanitizedData.compensation_other, 
        sanitizedData.project_description,
        sanitizedData.job_description, 
        sanitizedData.education_level, 
        sanitizedData.additional_requirements,
        sanitizedData.preferred_faculty_id, 
        sanitizedData.payment_type, 
        'draft'
      ]
    );

    const jobId = jobResult.rows[0].id;

    // บันทึกข้อมูลงวดการจ่ายเงิน
    if (sanitizedData.payment_type === 'installment' && Array.isArray(sanitizedData.payment_installments)) {
      for (let i = 0; i < sanitizedData.payment_installments.length; i++) {
        const installment = sanitizedData.payment_installments[i];
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

    return NextResponse.json({ 
      success: true, 
      message: 'สร้างประกาศงานสำเร็จ',
      jobId 
    });

  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการสร้างประกาศงาน:', error);
    
    // จัดการข้อผิดพลาดที่เกิดจาก foreign key constraint
    if (error.code === '23503') {
      return NextResponse.json(
        { 
          error: 'ข้อมูลอ้างอิงไม่ถูกต้อง', 
          details: 'ตรวจสอบข้อมูลที่อ้างอิง เช่น รหัสคณะ ประเภทงาน' 
        },
        { status: 400 }
      );
    }

    // จัดการข้อผิดพลาดทั่วไป
    return NextResponse.json(
      { 
        error: 'ไม่สามารถสร้างประกาศงานได้', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}