import type { NextAuthConfig } from "next-auth";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const authConfig: NextAuthConfig = {
  trustHost: true,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials, req) {
        const { rateLimit } = await import("./rate-limit");
        const ip =
          (req as any)?.headers?.get?.("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
        const email = String(credentials?.email || "").toLowerCase().trim();
        // Anti brute-force: 10 tentativas/min por IP+email (sem revelar o bloqueio)
        if (!rateLimit(`login:${ip}:${email}`, 10, 60_000).ok) return null;

        const audit = async (action: string, entityId?: string) => {
          try {
            await prisma.auditLog.create({
              data: { actorEmail: email || undefined, action, entity: "User", entityId, ip } as any,
            });
          } catch {}
        };

        // 1) env admin (legado)
        if (
          email &&
          process.env.ADMIN_EMAIL &&
          process.env.ADMIN_PASSWORD &&
          email === process.env.ADMIN_EMAIL.toLowerCase().trim() &&
          String(credentials?.password || "") === process.env.ADMIN_PASSWORD
        ) {
          await audit("LOGIN", "admin");
          return { id: "admin", email: credentials!.email as string, name: "Admin", role: "ADMIN" } as any;
        }
        // 2) DB users (inclui rafaelrabir@gmail.com)
        try {
          const user = await prisma.user.findUnique({ where: { email } });
          if (user?.passwordHash && user.role === "ADMIN") {
            const ok = await bcrypt.compare(String(credentials?.password || ""), user.passwordHash);
            if (ok) {
              await audit("LOGIN", user.id);
              return { id: user.id, email: user.email, name: user.name || "Admin", role: user.role } as any;
            }
          }
        } catch {}
        if (email) await audit("LOGIN_FAILED");
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