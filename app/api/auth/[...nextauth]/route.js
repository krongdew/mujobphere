import NextAuth from 'next-auth';
import GoogleProvider from "next-auth/providers/google";
import { handleUserSignIn } from '@/lib/auth/userManagement';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      return handleUserSignIn(user, account);
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.google_id = user.google_id;
        token.profile_image = user.profile_image;
        token.created_at = user.created_at;
        token.role = user.role;
        token.mahidol_id = user.mahidol_id;
        token.department = user.department;
        token.faculty = user.faculty;
        token.position = user.position;
        token.approval_status = user.approval_status;
        token.approved_at = user.approved_at;
        token.approved_by = user.approved_by;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.google_id = token.google_id;
        session.user.profile_image = token.profile_image;
        session.user.created_at = token.created_at;
        session.user.role = token.role;
        session.user.mahidol_id = token.mahidol_id;
        session.user.department = token.department;
        session.user.faculty = token.faculty;
        session.user.position = token.position;
        session.user.approval_status = token.approval_status;
        session.user.approved_at = token.approved_at;
        session.user.approved_by = token.approved_by;
      }
      return session;
    }
  },
  pages: {
    signIn: '/',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    },
    callbackUrl: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    },
    csrfToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Host-' : ''}next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  useSecureCookies: process.env.NODE_ENV === 'production',
};

// ตรวจสอบว่ามีการตั้งค่า environment variables ที่จำเป็น
if (!process.env.NEXTAUTH_URL) {
  console.warn('Warning: NEXTAUTH_URL is not set');
}

if (!process.env.NEXTAUTH_SECRET) {
  console.warn('Warning: NEXTAUTH_SECRET is not set');
}

const handler = NextAuth(authOptions);
export const dynamic = 'force-dynamic';
export { handler as GET, handler as POST };