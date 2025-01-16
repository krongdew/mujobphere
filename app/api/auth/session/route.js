import { getServerSession } from "next-auth";
import { authOptions } from "../[...nextauth]/route";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic'; // เพิ่มบรรทัดนี้

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    return NextResponse.json(session || { user: null });
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json({ error: 'Failed to get session' }, { status: 500 });
  }
}