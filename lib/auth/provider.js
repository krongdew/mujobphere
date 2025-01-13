import GoogleProvider from "next-auth/providers/google";

export const getAuthConfig = () => {
  return {
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      }),
    ],
    callbacks: {
      async signIn({ user, account }) {
        try {
          // Log sign in attempt
          console.log("Sign in attempt:", { email: user.email });

          // Determine role
          const role = determineRole(user.email);
          user.role = role;

          // Log assigned role
          console.log("Role assigned:", { email: user.email, role: role });

          return true;
        } catch (error) {
          console.error("Sign in error:", error);
          return false;
        }
      },
      async jwt({ token, user }) {
        // Add role to token when first creating it
        if (user) {
          token.role = user.role;
          console.log("JWT created:", { token });
        }
        return token;
      },
      async session({ session, token }) {
        // Add role to session
        if (session?.user) {
          session.user.role = token.role;
          console.log("Session created:", { session });
        }
        return session;
      }
    },
    pages: {
      signIn: "/",
      error: "/auth/error",
    },
    debug: true,
    session: {
      strategy: "jwt",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    }
  };
};

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