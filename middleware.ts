import type { NextFetchEvent, NextRequest } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// Admin e fornecedor continuam no Auth.js; clientes usam o Clerk.
const staffMiddleware = NextAuth(authConfig).auth as unknown as (
  request: NextRequest,
  event: NextFetchEvent
) => Promise<Response | undefined>;

const isStaffRoute = createRouteMatcher(["/admin(.*)", "/fornecedor(.*)"]);
const isCustomerAuthPage = createRouteMatcher(["/conta/login(.*)", "/conta/registar(.*)"]);
const isCustomerRoute = createRouteMatcher(["/conta(.*)", "/checkout(.*)"]);

export default clerkMiddleware(
  async (auth, request, event) => {
    if (isStaffRoute(request)) {
      return staffMiddleware(request, event);
    }

    if (isCustomerRoute(request) && !isCustomerAuthPage(request)) {
      await auth.protect();
    }
  },
  { signInUrl: "/conta/login", signUpUrl: "/conta/registar" }
);

export const config = {
  matcher: [
    // Todas as rotas exceto ficheiros estáticos e internos do Next
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
