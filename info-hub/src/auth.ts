import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { compare } from "bcrypt";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // 1. Check if user exists
        const user = await db.query.users.findFirst({
          where: eq(users.email, credentials.email as string),
        });

        // 2. If no user or no password (e.g. they only signed up via OAuth before)
        if (!user || !user.password) {
          return null; 
        }

        // 3. Verify password
        const isValid = await compare(credentials.password as string, user.password);

        if (!isValid) return null;

        // 4. Return user object (this session is stored in a cookie)
        return {
          id: user.id.toString(),
          email: user.email,
          name: user.fullName,
        };
      },
    }),
  ],
  callbacks: {
    // This allows us to access the user ID in the session on the dashboard
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login", // Custom login page
  },
  secret: process.env.AUTH_SECRET,
});