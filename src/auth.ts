import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Google from "next-auth/providers/google";
import { db } from "@/db";
import { users, accounts, sessions, verificationTokens } from "@/db/schema";

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
    // Reads AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET from the environment.
    Google({
      // Older accounts have no Google link yet, so they are matched by email.
      // This is safe only because the signIn callback requires a verified address.
      allowDangerousEmailAccountLinking: true,
      // Older accounts store lowercase emails, so the match must be lowercase too.
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email.toLowerCase(),
          image: profile.picture,
        };
      },
    }),
  ],

  // ── Custom Pages ─────────────────────────────────────────
  pages: {
    signIn: "/login",
    error: "/login",
  },

  // ── Callbacks ────────────────────────────────────────────
  callbacks: {
    /**
     * Sign-in callback — only accept addresses Google has verified, so
     * nobody can reach an older account with an unconfirmed email.
     */
    signIn({ profile }) {
      return profile?.email_verified === true;
    },

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

      // Support missing locale or explicit locales /en, /vi
      const isProtected = request.nextUrl.pathname.match(
        /^(\/(en|vi))?\/dashboard/,
      );

      if (isProtected && !isAuthenticated) {
        // Extract locale to maintain it during login redirect
        const match = request.nextUrl.pathname.match(/^\/(en|vi)\//);
        const locale = match ? match[1] : "";
        const loginPath = locale ? `/${locale}/login` : "/login";

        const loginUrl = new URL(loginPath, request.nextUrl.origin);
        loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
        return Response.redirect(loginUrl);
      }

      return true;
    },
  },

  // ── Trust Host ───────────────────────────────────────────
  trustHost: true,
});
