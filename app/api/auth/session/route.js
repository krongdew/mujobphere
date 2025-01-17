import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    return NextResponse.json(session || { user: null });
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json({ error: 'Failed to get session' }, { status: 500 });
  }
}