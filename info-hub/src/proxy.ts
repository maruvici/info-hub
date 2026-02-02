import { auth } from "@/auth";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // 1. Define your page types
  const isPublicPage = nextUrl.pathname === "/login" || nextUrl.pathname === "/signup";
  // Assuming your dashboard and user pages are under these paths
  const isPlatformPage = nextUrl.pathname.startsWith("/dashboard") || 
                         nextUrl.pathname.startsWith("/user") ||
                         nextUrl.pathname.startsWith("/post");

  // 2. Redirect Logic
  if (isPlatformPage && !isLoggedIn) {
    // Not logged in? Send to login
    return Response.redirect(new URL("/login", nextUrl));
  }

  if (isPublicPage && isLoggedIn) {
    // Already logged in? Don't show login/signup, send to dashboard
    return Response.redirect(new URL("/dashboard", nextUrl));
  }

  return; // Continue to the requested page
});

// 3. The Matcher (Crucial for Performance)
export const config = {
  /*
   * Match all request paths except for the ones starting with:
   * - api (API routes)
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   */
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};