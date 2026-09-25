import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// Next.js 16 renamed Middleware to Proxy; this is the same route protection
// that previously lived in middleware.ts.
export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard");

  if (isOnDashboard && !isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/dashboard/:path*"],
};