import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";

import { prisma } from "./prisma";
import { Role, WellnessLevel } from "@/generated/prisma/enums";

type AuthSessionUser = {
  id: string;
  role: Role;
  department: string | null;
  year: number | null;
  preferredLanguage: string;
  streak: number;
  xpPoints: number;
  wellnessLevel: WellnessLevel;
};

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret:
    (process.env.NEXTAUTH_SECRET ?? "").trim().length > 0
      ? process.env.NEXTAUTH_SECRET
      : "mindcare-dev-secret",
  session: {
    // Using JWT sessions makes the prototype work smoothly without needing
    // DB-backed session persistence (your current dev setup uses SQLite fallback).
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase();
        const password = credentials?.password;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          role: user.role,
          department: user.department,
          year: user.year,
          preferredLanguage: user.preferredLanguage,
          streak: user.streak,
          xpPoints: user.xpPoints,
          wellnessLevel: user.wellnessLevel,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      // On initial sign-in, NextAuth passes `user`.
      if (user) {
        const u = user as unknown as AuthSessionUser;
        token.id = u.id;
        token.role = u.role;
        token.department = u.department;
        token.year = u.year;
        token.preferredLanguage = u.preferredLanguage;
        token.streak = u.streak;
        token.xpPoints = u.xpPoints;
        token.wellnessLevel = u.wellnessLevel;
      }

      // Keep JWT in sync with the database so language changes apply immediately.
      // This avoids the “always English” issue after updating `preferredLanguage`.
      if (token.id && typeof token.id === "string") {
        const dbUser = await prisma.user.findUnique({ where: { id: token.id } });
        if (dbUser) {
          token.role = dbUser.role;
          token.department = dbUser.department;
          token.year = dbUser.year;
          token.preferredLanguage = dbUser.preferredLanguage;
          token.streak = dbUser.streak;
          token.xpPoints = dbUser.xpPoints;
          token.wellnessLevel = dbUser.wellnessLevel;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const t = token as Partial<AuthSessionUser>;
        session.user.id = t.id ?? session.user.id ?? "";
        session.user.role = t.role ?? session.user.role;
        session.user.department = t.department ?? session.user.department;
        session.user.year = t.year ?? session.user.year;
        session.user.preferredLanguage =
          t.preferredLanguage ?? session.user.preferredLanguage ?? "en";
        session.user.streak = t.streak ?? session.user.streak ?? 0;
        session.user.xpPoints = t.xpPoints ?? session.user.xpPoints ?? 0;
        session.user.wellnessLevel = t.wellnessLevel ?? session.user.wellnessLevel;
      }
      return session;
    },
  },
};

// Convenience export for route handlers.
export const handler = NextAuth(authOptions);

