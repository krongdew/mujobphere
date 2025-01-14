import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

// สร้าง intl middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always'
});

export default async function middleware(request: NextRequest) {
  // ข้ามการตรวจสอบสำหรับ auth routes
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // เรียกใช้ intl middleware
  const response = await intlMiddleware(request);
  
  // เพิ่ม Security Headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // เพิ่ม cookie security settings
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Set-Cookie', 'Path=/; Secure; SameSite=Strict');
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)' // ไม่รวม static files และ API routes
  ]
};