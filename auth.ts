import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";
import { loginSchema } from "@/lib/validations/auth";
import { findOrCreateGoogleCustomer } from "@/lib/customer-google";

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
    // Login de clientes com Google. Lê AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET do ambiente.
    Google,
  ],
  callbacks: {
    ...authConfig.callbacks,
    signIn({ account, profile }) {
      if (account?.provider !== "google") return true;
      // Só aceitar emails verificados pelo Google — a conta é ligada a um Customer pelo email.
      if (!profile?.email || !profile.email_verified) return "/conta/login?erro=google";
      return true;
    },
    async jwt({ token, user, account, profile }) {
      if (account?.provider === "google" && profile?.email) {
        const customer = await findOrCreateGoogleCustomer({
          googleId: account.providerAccountId,
          email: profile.email,
          name: profile.name,
        });
        token.sub = customer.id;
        token.email = customer.email;
        token.role = "CUSTOMER";
        return token;
      }
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
