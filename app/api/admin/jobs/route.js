// app/api/admin/jobs/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/db/queries';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    
    // Check if requesting all jobs for filter dropdown
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
         GROUP BY j.id, j.title
         ORDER BY j.title`,
        []
      );

      // Return just the array of jobs for the filter
      return NextResponse.json(result.rows);
    }
    
    // Standard job listing with pagination
    const period = searchParams.get('period') || '6'; // Default to 6 months
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;
    const status = searchParams.get('status');
    const employer = searchParams.get('employer');

    // Base query
    let countQuery = `
      SELECT COUNT(*) as total
      FROM job_posts j
      LEFT JOIN users u ON j.user_id = u.id
      WHERE 1=1
    `;

    let jobsQuery = `
      SELECT 
        j.*,
        u.name as employer_name,
        u.email as employer_email,
        COUNT(DISTINCT a.id) as application_count
      FROM job_posts j
      LEFT JOIN users u ON j.user_id = u.id
      LEFT JOIN job_applications a ON j.id = a.job_post_id
      WHERE 1=1
    `;

    // Parameters for the query
    const queryParams = [];
    let paramIndex = 1;

    // Add period filter if not 'all'
    if (period !== 'all') {
      countQuery += ` AND j.created_at > CURRENT_DATE - INTERVAL '${period} months'`;
      jobsQuery += ` AND j.created_at > CURRENT_DATE - INTERVAL '${period} months'`;
    }

    // Add status filter if provided
    if (status && status !== 'all') {
      countQuery += ` AND j.status = $${paramIndex}`;
      jobsQuery += ` AND j.status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }

    // Add employer filter if provided
    if (employer && employer !== 'all') {
      countQuery += ` AND j.user_id = $${paramIndex}`;
      jobsQuery += ` AND j.user_id = $${paramIndex}`;
      queryParams.push(employer);
      paramIndex++;
    }

    // Finish the queries
    jobsQuery += `
      GROUP BY j.id, u.name, u.email
      ORDER BY j.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    queryParams.push(limit, offset);

    // Get total count for pagination
    const countResult = await query(countQuery, queryParams.slice(0, paramIndex - 1));
    const total = parseInt(countResult.rows[0].total);

    // Get paginated jobs with application count
    const result = await query(jobsQuery, queryParams);

    return NextResponse.json({
      jobs: result.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}





