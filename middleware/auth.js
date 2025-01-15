// middleware/auth.js
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

// Helper functions
const redirect = (request) => {
  const loginUrl = new URL('/', request.url);
  const from = request.nextUrl.pathname;
  if (from) {
    loginUrl.searchParams.set('from', from);
  }
  return NextResponse.redirect(loginUrl);
};

const checkRole = (userRole, allowedRoles) => {
  return allowedRoles.includes(userRole);
};

// Function สำหรับตรวจสอบ SSO token (สำหรับอนาคต)
async function validateSSOToken(request) {
  // TODO: Implement SSO token validation
  // 1. ดึง token จาก header หรือ cookie
  // 2. ตรวจสอบกับ SSO server
  // 3. แปลง response เป็นรูปแบบที่ต้องการ
  // 4. return token object หรือ null
  
  // const token = request.headers.get('x-sso-token');
  // const response = await fetch('https://sso.mahidol.ac.th/validate', {
  //   headers: { Authorization: `Bearer ${token}` }
  // });
  // return response.ok ? await response.json() : null;
  
  return null;
}

export async function withAuth(request, allowedRoles = null) {
  try {
    // Skip auth check for API and static routes
    if (request.nextUrl.pathname.startsWith('/api/auth')) {
      return NextResponse.next();
    }

    // ตรวจสอบว่าใช้ SSO หรือไม่
    const useSSO = process.env.USE_SSO === 'true';

    if (useSSO) {
      // สำหรับ SSO ในอนาคต
      const ssoToken = await validateSSOToken(request);
      if (!ssoToken) {
        return redirect(request);
      }

      if (allowedRoles && !checkRole(ssoToken.role, allowedRoles)) {
        return redirect(request);
      }

      return NextResponse.next();
    }

    // สำหรับ NextAuth
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return redirect(request);
    }

    if (allowedRoles && !checkRole(token.role, allowedRoles)) {
      return redirect(request);
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return redirect(request);
  }
}

// Middleware สำหรับแต่ละ role
export function withEmployerAuth(request) {
  return withAuth(request, ['employer', 'employeroutside', 'admin']);
}

export function withStudentAuth(request) {
  return withAuth(request, ['student', 'admin']);
}

export function withAdminAuth(request) {
  return withAuth(request, ['admin']);
}

// Constants สำหรับ roles
export const ROLES = {
  ADMIN: 'admin',
  STUDENT: 'student',
  EMPLOYER: 'employer',
  EMPLOYER_OUTSIDE: 'employeroutside'
};

// Helper function สำหรับตรวจสอบว่าเป็น admin หรือไม่
export function isAdmin(role) {
  return role === ROLES.ADMIN;
}