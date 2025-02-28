// app/api/jobs/featured/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/db/queries';

// เก็บ cache ของผลลัพธ์
let cachedJobs = null;
let lastFetchTime = null;

export async function GET(request) {
  try {
    // ตรวจสอบ cache
    const currentTime = Date.now();
    if (cachedJobs && lastFetchTime && (currentTime - lastFetchTime < 60000)) {
      console.log("Returning cached urgent jobs");
      return NextResponse.json(cachedJobs);
    }

    const jobsResult = await query(`
      SELECT * FROM (
        SELECT DISTINCT ON (id) *,
          (application_end_date::date - CURRENT_DATE) as days_remaining
        FROM job_posts 
        WHERE 
          application_start_date IS NOT NULL AND 
          application_end_date IS NOT NULL AND
          application_end_date >= CURRENT_DATE AND
          application_start_date <= CURRENT_DATE AND
          (application_end_date::date - application_start_date::date) <= 7
      ) sub
      ORDER BY days_remaining ASC
      LIMIT 10
    `);

    console.log("Total unique urgent jobs fetched:", jobsResult.rows.length);
    
    if (jobsResult.rows.length === 0) {
      // ถ้าไม่มีงานด่วน ให้ดึงงานทั่วไปที่ยังรับสมัครอยู่
      const regularJobsResult = await query(`
        SELECT DISTINCT ON (id) * 
        FROM job_posts 
        WHERE 
          application_start_date IS NOT NULL AND 
          application_end_date IS NOT NULL AND
          application_end_date >= CURRENT_DATE
        ORDER BY id, created_at DESC 
        LIMIT 10
      `);

      console.log("Fallback to unique regular jobs:", regularJobsResult.rows.length);
      
      // เก็บ cache
      cachedJobs = regularJobsResult.rows;
      lastFetchTime = currentTime;
      
      return NextResponse.json(regularJobsResult.rows);
    }

    // บันทึก log รายละเอียดงานด่วน
    jobsResult.rows.forEach(job => {
      const startDate = new Date(job.application_start_date);
      const endDate = new Date(job.application_end_date);
      const diffTime = Math.abs(endDate - startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // console.log(`Urgent Job ID: ${job.id}`);
      // console.log(`Total Application Period: ${diffDays} days`);
      // console.log(`Days Remaining: ${job.days_remaining} days`);
      // console.log(`Start Date: ${startDate}`);
      // console.log(`End Date: ${endDate}`);
      // console.log('---');
    });
    
    // เก็บ cache
    cachedJobs = jobsResult.rows;
    lastFetchTime = currentTime;
    
    return NextResponse.json(jobsResult.rows);
  } catch (error) {
    console.error('Error fetching urgent jobs:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch urgent jobs: ' + error.message },
      { status: 500 }
    );
  }
}