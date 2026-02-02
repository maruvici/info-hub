import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // 1. Explicitly define paths
  const isLoginPage = nextUrl.pathname === "/login";
  const isSignupPage = nextUrl.pathname === "/signup";
  const isPublicPage = isLoginPage || isSignupPage;
  
  const isPlatformPage = nextUrl.pathname.startsWith("/dashboard") || 
                         nextUrl.pathname.startsWith("/user") ||
                         nextUrl.pathname.startsWith("/post");

  // 2. Logic: If trying to access platform while logged out -> Send to Login
  if (isPlatformPage && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // 3. Logic: If trying to access login/signup while logged IN -> Send to Dashboard
  // IMPORTANT: We use nextUrl.pathname check to prevent looping
  if (isPublicPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  // We MUST exclude the internal Next.js paths and static assets
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};