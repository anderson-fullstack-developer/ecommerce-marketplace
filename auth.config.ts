import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/admin/login",
  },
  providers: [],
  callbacks: {
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = (auth?.user as { role?: string } | undefined)?.role;
      const { pathname } = nextUrl;

      function redirectToLogin(loginPath: string) {
        const loginUrl = new URL(loginPath, nextUrl);
        loginUrl.searchParams.set("callbackUrl", nextUrl.href);
        return Response.redirect(loginUrl);
      }

      if (pathname.startsWith("/admin")) {
        const isLoginPage = pathname === "/admin/login";

        if (isLoginPage) {
          if (isLoggedIn && role === "ADMIN") {
            return Response.redirect(new URL("/admin/dashboard", nextUrl));
          }
          return true;
        }

        if (isLoggedIn && role === "ADMIN") return true;
        return redirectToLogin("/admin/login");
      }

      if (pathname.startsWith("/fornecedor")) {
        const isLoginPage = pathname === "/fornecedor/login";

        if (isLoginPage) {
          if (isLoggedIn && role === "VENDOR") {
            return Response.redirect(new URL("/fornecedor/painel", nextUrl));
          }
          return true;
        }

        if (isLoggedIn && role === "VENDOR") return true;
        return redirectToLogin("/fornecedor/login");
      }

      if (pathname.startsWith("/conta")) {
        const isPublicPage = pathname === "/conta/login" || pathname === "/conta/registar";

        if (isPublicPage) {
          if (isLoggedIn && role === "CUSTOMER") {
            return Response.redirect(new URL("/conta/encomendas", nextUrl));
          }
          return true;
        }

        if (isLoggedIn && role === "CUSTOMER") return true;
        return redirectToLogin("/conta/login");
      }

      if (pathname.startsWith("/checkout")) {
        if (isLoggedIn && role === "CUSTOMER") return true;
        return redirectToLogin("/conta/login");
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
