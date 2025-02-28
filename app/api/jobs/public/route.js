// app/api/jobs/public/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db/queries';

export async function GET(request) {
  try {
    // รับค่า query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    
    // รับค่า filter parameters
    const keyword = searchParams.get('keyword');
    const location = searchParams.get('location');
    const category = searchParams.get('category');
    const jobType = searchParams.get('jobType');
    const datePosted = searchParams.get('datePosted');
    const salaryMin = searchParams.has('salaryMin') ? parseFloat(searchParams.get('salaryMin')) : null;
    const salaryMax = searchParams.has('salaryMax') ? parseFloat(searchParams.get('salaryMax')) : null;
    const hireType = searchParams.get('hireType');
    const educationLevel = searchParams.get('educationLevel');
    
    // สร้าง WHERE clause สำหรับการกรอง
    let whereConditions = [`jp.status = 'published'`, `jp.application_end_date >= CURRENT_DATE`];
    let queryParams = [];
    let paramIndex = 1; // เริ่มที่ param $1
    
    // SQL query ส่วนหลัก (ไม่รวม where conditions ที่เปลี่ยนแปลงได้)
    const baseQuery = `
      SELECT 
        jp.id, 
        jp.user_id,
        jp.title, 
        jp.hire_type,
        jp.job_type_id,
        jp.job_description,
        jp.application_start_date,
        jp.application_end_date,
        jp.work_start_date,
        jp.work_end_date,
        jp.is_online,
        jp.location,
        jp.compensation_amount,
        jp.compensation_period,
        jp.education_level,
        jp.created_at,
        jt.name as job_type_name
      FROM job_posts jp
      LEFT JOIN job_type_categories jt ON jp.job_type_id = jt.id
    `;
    
    // เพิ่มเงื่อนไขการกรอง
    if (keyword) {
      whereConditions.push(`(jp.title ILIKE $${paramIndex} OR jp.job_description ILIKE $${paramIndex})`);
      queryParams.push(`%${keyword}%`);
      paramIndex++;
    }

    if (location) {
      if (location === 'online') {
        whereConditions.push(`jp.is_online = true`);
      } else if (location === 'onsite') {
        whereConditions.push(`jp.is_online = false`);
      } else {
        whereConditions.push(`jp.location ILIKE $${paramIndex}`);
        queryParams.push(`%${location}%`);
        paramIndex++;
      }
    }

    if (category) {
      whereConditions.push(`jp.job_type_id = $${paramIndex}`);
      queryParams.push(parseInt(category));
      paramIndex++;
    }

    if (jobType) {
      const jobTypeIds = jobType.split(',').map(id => parseInt(id));
      if (jobTypeIds.length === 1) {
        whereConditions.push(`jp.job_type_id = $${paramIndex}`);
        queryParams.push(jobTypeIds[0]);
        paramIndex++;
      } else if (jobTypeIds.length > 1) {
        const placeholders = jobTypeIds.map((_, idx) => `$${paramIndex + idx}`).join(', ');
        whereConditions.push(`jp.job_type_id IN (${placeholders})`);
        queryParams.push(...jobTypeIds);
        paramIndex += jobTypeIds.length;
      }
    }

    if (datePosted && datePosted !== 'all') {
      const now = new Date();
      let filterDate = new Date();
      
      switch(datePosted) {
        case 'last_24h':
          filterDate.setHours(now.getHours() - 24);
          break;
        case 'last_3_days':
          filterDate.setDate(now.getDate() - 3);
          break;
        case 'last_7_days':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'last_14_days':
          filterDate.setDate(now.getDate() - 14);
          break;
      }
      
      whereConditions.push(`jp.created_at >= $${paramIndex}`);
      queryParams.push(filterDate.toISOString());
      paramIndex++;
    }

    if (salaryMin !== null) {
      whereConditions.push(`jp.compensation_amount >= $${paramIndex}`);
      queryParams.push(salaryMin);
      paramIndex++;
    }

    if (salaryMax !== null) {
      whereConditions.push(`jp.compensation_amount <= $${paramIndex}`);
      queryParams.push(salaryMax);
      paramIndex++;
    }

    if (hireType) {
      whereConditions.push(`jp.hire_type = $${paramIndex}`);
      queryParams.push(hireType);
      paramIndex++;
    }

    if (educationLevel) {
      whereConditions.push(`jp.education_level = $${paramIndex}`);
      queryParams.push(educationLevel);
      paramIndex++;
    }

    // รวม WHERE clause
    const whereClause = whereConditions.length 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    // คำนวณ OFFSET สำหรับ SQL
    const offset = (page - 1) * pageSize;

    // สร้างคำสั่ง SQL สำหรับดึงข้อมูลงาน
    const jobsSql = `
      ${baseQuery}
      ${whereClause}
      ORDER BY jp.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    // เพิ่ม parameters สำหรับ LIMIT และ OFFSET
    queryParams.push(pageSize, offset);

    console.log('SQL Query:', jobsSql);
    console.log('Parameters:', queryParams);

    // ดึงข้อมูลงาน
    const jobsResult = await query(jobsSql, queryParams);

    // นับจำนวนงานทั้งหมดเพื่อใช้ในการคำนวณหน้า
    const countSql = `
      SELECT COUNT(*) as total
      FROM job_posts jp
      LEFT JOIN job_type_categories jt ON jp.job_type_id = jt.id
      ${whereClause}
    `;

    // ใช้ parameters เฉพาะส่วนที่เกี่ยวข้องกับ WHERE clause (ไม่รวม LIMIT และ OFFSET)
    const countParams = queryParams.slice(0, -2);
    
    console.log('Count SQL:', countSql);
    console.log('Count Parameters:', countParams);
    
    const countResult = await query(countSql, countParams);

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      jobs: jobsResult.rows,
      pagination: {
        currentPage: page,
        pageSize: pageSize,
        totalItems: total,
        totalPages: totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching public jobs:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch jobs', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// Ensure this route can be dynamically rendered
export const dynamic = 'force-dynamic';