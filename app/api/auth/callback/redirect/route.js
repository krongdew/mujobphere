import { getServerSession } from "next-auth/next";
import { authOptions } from "../../[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (session?.user?.role === 'student') {
    return NextResponse.redirect(new URL('/candidates-dashboard/my-profile', process.env.NEXTAUTH_URL));
  } else if (session?.user?.role === 'employer' || session?.user?.role === 'employeroutside') {
    return NextResponse.redirect(new URL('/employers-dashboard/company-profile', process.env.NEXTAUTH_URL));
  }
  
  return NextResponse.redirect(new URL('/', process.env.NEXTAUTH_URL));
}