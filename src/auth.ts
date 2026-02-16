import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import {
  users,
  accounts,
  sessions,
  verificationTokens,
} from "@/db/schema";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // ── Adapter ──────────────────────────────────────────────
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),

  // ── Session Strategy ─────────────────────────────────────
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // ── Providers ────────────────────────────────────────────
  providers: [
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        if (!email) return null;

        const normalizedEmail = email.toLowerCase().trim();

        // Look up existing user
        const existing = await db
          .select()
          .from(users)
          .where(eq(users.email, normalizedEmail))
          .limit(1);

        if (existing.length > 0) {
          return {
            id: existing[0].id,
            email: existing[0].email,
            name: existing[0].name,
          };
        }

        // Auto-create new user
        const [newUser] = await db
          .insert(users)
          .values({
            email: normalizedEmail,
            emailVerified: new Date(),
          })
          .returning();

        return {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
        };
      },
    }),
  ],

  // ── Custom Pages ─────────────────────────────────────────
  pages: {
    signIn: "/login",
  },

  // ── Callbacks ────────────────────────────────────────────
  callbacks: {
    /**
     * JWT callback — attach user ID to the token so we can
     * use it in session and Server Actions for RLS checks.
     */
    jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
      }
      return token;
    },

    /**
     * Session callback — expose user.id on the client-side
     * session object for RLS-style authorization checks.
     */
    session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },

    /**
     * Authorized callback — used by middleware to check if
     * the user is authenticated before accessing protected routes.
     * Returns Response for unauthorized access (redirect to login).
     */
    authorized({ auth: session, request }) {
      const isAuthenticated = !!session?.user;
      const isProtected = request.nextUrl.pathname.startsWith("/dashboard");

      if (isProtected && !isAuthenticated) {
        const loginUrl = new URL("/login", request.nextUrl.origin);
        loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
        return Response.redirect(loginUrl);
      }

      return true;
    },
  },

  // ── Trust Host ───────────────────────────────────────────
  trustHost: true,
});
