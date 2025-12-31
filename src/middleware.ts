import { NextRequest, NextResponse } from 'next/server';

// Define the role enum to match your types
const ROLES = {
  PATIENT: 'PATIENT',
  FREELANCER: 'FREELANCER',
  TEAM: 'TEAM',
  ADMIN: 'ADMIN',
} as const;

interface DecodedToken {
  sub: string;
  email: string;
  role: string;
  subscriptionStatus?: string;
  iat: number;
  exp: number;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the token from cookies
  const token = request.cookies.get('token')?.value;

  // Define protected routes that require authentication
  const protectedRoutes = ['/dashboard'];
  const authRoutes = ['/authentication'];
  const adminRoutes = ['/dashboard/admin'];

  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  // Validate token (check existence and expiration)
  const isTokenValid = validateToken(token);

  // If accessing protected route without valid token, redirect to authentication
  if (isProtectedRoute && !isTokenValid) {
    return NextResponse.redirect(new URL('/authentication/sign-in', request.url));
  }

  // If accessing auth routes with valid token, redirect to dashboard
  if (isAuthRoute && isTokenValid) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Check admin routes - require valid token AND admin role
  if (isAdminRoute) {
    if (!isTokenValid) {
      return NextResponse.redirect(new URL('/authentication/sign-in', request.url));
    }

    // Decode token to check role
    const decodedToken = decodeToken(token!);
    if (!decodedToken || decodedToken.role !== ROLES.ADMIN) {
      // Redirect non-admin users to dashboard with error
      const url = new URL('/dashboard', request.url);
      url.searchParams.set('error', 'access_denied');
      return NextResponse.redirect(url);
    }
  }

  // Allow all other requests to proceed
  return NextResponse.next();
}

// Server-side token validation
function validateToken(token: string | undefined): boolean {
  if (!token) return false;

  try {
    // JWT is header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    // Decode payload (base64url to base64, then to string)
    const payload = parts[1];
    const base64 = payload?.replace(/-/g, '+').replace(/_/g, '/') || '';
    const decodedPayload = JSON.parse(atob(base64));

    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (decodedPayload.exp && decodedPayload.exp < currentTime) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

// Decode token to extract role
function decodeToken(token: string): DecodedToken | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const base64 = payload?.replace(/-/g, '+').replace(/_/g, '/') || '';
    const decodedPayload = JSON.parse(atob(base64));

    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (decodedPayload.exp && decodedPayload.exp < currentTime) {
      return null;
    }

    return decodedPayload as DecodedToken;
  } catch (error) {
    return null;
  }
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
