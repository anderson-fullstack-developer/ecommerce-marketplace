import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";
import { loginSchema } from "@/lib/validations/auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      id: "credentials",
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });
        if (!user) return null;

        const passwordsMatch = await bcrypt.compare(parsed.data.password, user.password);
        if (!passwordsMatch) return null;

        return { id: user.id, email: user.email, role: user.role };
      },
    }),
    Credentials({
      id: "vendor-credentials",
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const vendor = await prisma.vendor.findUnique({
          where: { email: parsed.data.email },
        });
        if (!vendor || vendor.status !== "APPROVED") return null;

        const passwordsMatch = await bcrypt.compare(parsed.data.password, vendor.password);
        if (!passwordsMatch) return null;

        return { id: vendor.id, email: vendor.email, role: "VENDOR" };
      },
    }),
    Credentials({
      id: "customer-credentials",
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const customer = await prisma.customer.findUnique({
          where: { email: parsed.data.email },
        });
        if (!customer || !customer.password) return null;

        const passwordsMatch = await bcrypt.compare(parsed.data.password, customer.password);
        if (!passwordsMatch) return null;

        return { id: customer.id, email: customer.email, role: "CUSTOMER" };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});
