import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the token from cookies (set by loginUser.fulfilled in authSlice)
  const token = request.cookies.get('token')?.value;

  // Define protected routes that require authentication
  const protectedRoutes = ['/dashboard'];
  const authRoutes = ['/authentication'];

  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const isRootRoute = pathname === '/';

  // If accessing protected route without token, redirect to authentication
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/authentication/sign-in', request.url));
  }

  // If accessing auth routes with valid token, redirect to dashboard
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If accessing root path with token, redirect to dashboard
  if (isRootRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Allow all other requests to proceed
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
