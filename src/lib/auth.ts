import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        // MVP: admin mock; em produção consultar Prisma User
        if (credentials?.email === process.env.ADMIN_EMAIL && credentials?.password === process.env.ADMIN_PASSWORD) {
          return { id: "admin", email: credentials.email as string, name: "Admin", role: "ADMIN" } as any;
        }
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
