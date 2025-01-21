// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';
import { withEmployerAuth, withStudentAuth, withAdminAuth } from './middleware/auth';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always'
});

const publicPaths = [
  '/api/auth',
  '/_next',
  '/images',
  '/uploads',  // เพิ่ม path สำหรับรูปภาพ
  '/favicon.ico',
  '/api/auth/callback'
];

function isPublicPath(path: string): boolean {
  return publicPaths.some(publicPath => path.startsWith(publicPath));
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // ถ้าเป็น path ของรูปภาพ ให้ข้าม middleware
  if (pathname.startsWith('/uploads/')) {
    return NextResponse.next();
  }

  // Handle auth checks first
  let authResponse;

  if (pathname.startsWith('/admin-dashboard')) {
    authResponse = await withAdminAuth(request);
    if (authResponse.status !== 200) return authResponse;
  } else if (pathname.startsWith('/employers-dashboard')) {
    authResponse = await withEmployerAuth(request);
    if (authResponse.status !== 200) return authResponse;
  } else if (pathname.startsWith('/candidates-dashboard')) {
    authResponse = await withStudentAuth(request);
    if (authResponse.status !== 200) return authResponse;
  }

  // If auth passed or not required, handle intl
  const response = await intlMiddleware(request);

  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

export const config = {
  matcher: [
    // ไม่ใช้ middleware กับ path ที่เริ่มต้นด้วย uploads, api, _next, _vercel
    '/((?!uploads|api|_next|_vercel|.*\\..*).*)'
  ]
};

// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';
// import createIntlMiddleware from 'next-intl/middleware';
// import { locales, defaultLocale } from './i18n';

// // สร้าง intl middleware
// const intlMiddleware = createIntlMiddleware({
//   locales,
//   defaultLocale,
//   localePrefix: 'always'
// });

// // แยก public paths
// const publicPaths = [
//   '/api/auth',
//   '/_next',
//   '/images',
//   '/favicon.ico',
//   '/api/auth/callback'
// ];

// const isPublicPath = (path: string) => 
//   publicPaths.some(publicPath => path.startsWith(publicPath));

// export default async function middleware(request: NextRequest) {
//   // Skip middleware for public paths
//   if (isPublicPath(request.nextUrl.pathname)) {
//     return NextResponse.next();
//   }

//   // Handle intl
//   const response = await intlMiddleware(request);
  
//   // Add security headers
//   response.headers.set('X-Frame-Options', 'DENY');
//   response.headers.set('X-Content-Type-Options', 'nosniff');
//   response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
//   return response;
// }

// export const config = {
//   matcher: [
//     '/((?!api|_next|_vercel|.*\\..*).*)' // Skip API and static files
//   ]
// };