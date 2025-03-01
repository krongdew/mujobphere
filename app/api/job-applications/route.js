// app/api/job-applications/route.js
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { query } from "@/lib/db/queries";

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || 
        (session.user.role !== 'employer' && session.user.role !== 'employeroutside')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters for pagination and filtering
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '6');
    const jobId = searchParams.get('jobId') || '';
    const offset = (page - 1) * limit;

    // Filter by job if jobId is provided
    const jobFilter = jobId ? 'AND ja.job_post_id = $2' : '';
    
    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM job_applications ja
      JOIN job_posts jp ON ja.job_post_id = jp.id
      WHERE jp.user_id = $1 ${jobFilter}
    `;
    
    const countParams = jobId ? [session.user.id, jobId] : [session.user.id];
    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    // Get paginated applications with student info
    const applicationsQuery = `
      SELECT 
        ja.*,
        sp.first_name,
        sp.last_name,
        sp.faculty,
        sp.major,
        sp.gpa,
        sp.img_student,
        sp.programming_skills,
        sp.language_skills,
        sp.user_id as student_user_id,
        jp.title as job_title,
        jp.user_id as employer_user_id
      FROM job_applications ja
      JOIN student_profiles sp ON ja.student_profile_id = sp.id
      JOIN job_posts jp ON ja.job_post_id = jp.id
      WHERE jp.user_id = $1 ${jobFilter}
      ORDER BY ja.applied_at DESC
      LIMIT $${jobId ? '3' : '2'} OFFSET $${jobId ? '4' : '3'}
    `;

    const applicationsParams = jobId 
      ? [session.user.id, jobId, limit, offset] 
      : [session.user.id, limit, offset];
    
    const applicationsResult = await query(applicationsQuery, applicationsParams);

    return NextResponse.json({
      applications: applicationsResult.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

// app/api/jobs/employer/route.js - Add an endpoint to get all jobs for filtering
export async function getAllJobs() {
  // This is a duplicate of code for illustration. The actual implementation should modify
  // the existing employer route.js to support the 'all' parameter for fetching job titles.
  
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const allJobs = searchParams.get('all') === 'true';

    if (allJobs) {
      // Get all jobs with application counts for the filter dropdown
      const result = await query(
        `SELECT 
          j.id,
          j.title,
          COUNT(DISTINCT a.id) as application_count
         FROM job_posts j
         LEFT JOIN job_applications a ON j.id = a.job_post_id
         WHERE j.user_id = $1
         GROUP BY j.id, j.title
         ORDER BY j.title`,
        [session.user.id]
      );

      return NextResponse.json(result.rows);
    }
    
    // Existing code for normal job listing...
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}