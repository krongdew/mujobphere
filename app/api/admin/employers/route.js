// app/api/admin/employers/route.js
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get employers who have posted jobs
    const result = await query(
      `SELECT DISTINCT 
        u.id, 
        u.name, 
        u.email,
        COUNT(j.id) as job_count
       FROM users u
       JOIN job_posts j ON u.id = j.user_id
       GROUP BY u.id, u.name, u.email
       ORDER BY u.name`,
      []
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching employers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employers' },
      { status: 500 }
    );
  }
}