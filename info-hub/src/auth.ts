import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { compare } from "bcrypt";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
      issuer: `https://login.microsoftonline.com/${process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID}/v2.0`,
    }),
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
    async signIn({ user, account, profile }) {
      if (account?.provider === "microsoft-entra-id") {
        const email = (profile?.email || user.email) as string;

        // Enforce @ssiph.com domain
        if (!email || !email.toLowerCase().endsWith("@ssiph.com")) {
          return "/login?error=InvalidDomain";
        }

        const existingUser = await db.query.users.findFirst({
          where: eq(users.email, email)
        });

        if (existingUser) {
          // Check if we need to link the MS ID to the existing record
          if (!existingUser.microsoftId) {
            await db.update(users)
              .set({ microsoftId: account.providerAccountId })
              .where(eq(users.id, existingUser.id));
          }
          
          user.id = existingUser.id.toString(); 
          return true; 
        } else {
          // Handle name formatting (Last, First -> First Last)
          let formattedName = profile?.name || "";
          if (formattedName.includes(",")) {
            const parts = formattedName.split(",");
            if (parts.length === 2) formattedName = `${parts[1].trim()} ${parts[0].trim()}`;
          }

          return `/signup?email=${encodeURIComponent(email)}&name=${encodeURIComponent(formattedName)}&providerAccountId=${account.providerAccountId}`;
        }
      }
      return true; // Allow standard credentials login
    },
    async jwt({ token, user }) {
      // Inject the DB user ID into the JWT token upon login
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      // Make the DB user ID accessible in client/server components via session.user.id
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.AUTH_SECRET,
});