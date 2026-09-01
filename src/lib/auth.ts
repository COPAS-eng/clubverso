import type { NextAuthConfig } from "next-auth";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        // 1) env admin (legado)
        if (credentials?.email === process.env.ADMIN_EMAIL && credentials?.password === process.env.ADMIN_PASSWORD) {
          return { id: "admin", email: credentials.email as string, name: "Admin", role: "ADMIN" } as any;
        }
        // 2) DB users (inclui rafaelrabir@gmail.com)
        try {
          const user = await prisma.user.findUnique({ where: { email: String(credentials?.email || "").toLowerCase().trim() } });
          if (user?.passwordHash && user.role === "ADMIN") {
            const ok = await bcrypt.compare(String(credentials?.password || ""), user.passwordHash);
            if (ok) return { id: user.id, email: user.email, name: user.name || "Admin", role: user.role } as any;
          }
        } catch {}
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) { if (user) token.role = (user as any).role; return token; },
    async session({ session, token }: any) { (session.user as any).role = token.role; return session; },
  },
  pages: { signIn: "/login" },
};

export const { auth, handlers, signIn, signOut } = NextAuth(authConfig);