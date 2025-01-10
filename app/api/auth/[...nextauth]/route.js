import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import pool from '@/utils/db';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account.provider === 'google') {
        try {
          // ตรวจสอบว่ามีผู้ใช้นี้ในระบบแล้วหรือไม่
          const existingUser = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [user.email]
          );

          if (existingUser.rows.length === 0) {
            // ถ้ายังไม่มีผู้ใช้ ให้สร้างใหม่
            await pool.query(
              'INSERT INTO users (email, name, google_id, profile_image) VALUES ($1, $2, $3, $4)',
              [user.email, user.name, account.providerAccountId, user.image]
            );
          }

          return true;
        } catch (error) {
          console.error('Error during sign in:', error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      try {
        // ดึงข้อมูลผู้ใช้จากฐานข้อมูล
        const result = await pool.query(
          'SELECT * FROM users WHERE email = $1',
          [session.user.email]
        );

        if (result.rows[0]) {
          session.user.id = result.rows[0].id;
        }

        return session;
      } catch (error) {
        console.error('Error getting session:', error);
        return session;
      }
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };