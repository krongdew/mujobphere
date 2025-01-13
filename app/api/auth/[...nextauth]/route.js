import NextAuth from 'next-auth';
import GoogleProvider from "next-auth/providers/google";
import { query } from '@/utils/db';

const determineRole = (email) => {
  if (email === 'dewwiisunny14@gmail.com' || 
      email.endsWith('@student.mahidol.edu') || 
      email.endsWith('@student.mahidol.ac.th')) {
    return 'student';
  } else if (email.endsWith('@mahidol.ac.th') || 
             email.endsWith('@mahidol.edu')) {
    return 'employer';
  }
  return 'employeroutside';
};

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
          const role = determineRole(user.email);
          
          // ตรวจสอบผู้ใช้ที่มีอยู่
          const existingUser = await query(
            'SELECT * FROM users WHERE email = $1',
            [user.email]
          );

          if (existingUser.rows.length === 0) {
            // สร้างผู้ใช้ใหม่
            const insertResult = await query(
              `INSERT INTO users (email, name, google_id, profile_image, role) 
               VALUES ($1, $2, $3, $4, $5) 
               RETURNING id`,
              [user.email, user.name, account.providerAccountId, user.image, role]
            );

            user.id = insertResult.rows[0].id;
            user.role = role;
          } else {
            // อัพเดทข้อมูลผู้ใช้ที่มีอยู่
            await query(
              `UPDATE users 
               SET name = $1, google_id = $2, profile_image = $3, role = $4 
               WHERE email = $5`,
              [user.name, account.providerAccountId, user.image, role, user.email]
            );
            
            user.id = existingUser.rows[0].id;
            user.role = role;
          }
          return true;
        } catch (error) {
          console.error('Database error:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };