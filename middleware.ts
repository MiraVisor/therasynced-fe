import { jwtDecode } from 'jwt-decode';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/authentication/sign-in',
  '/authentication/sign-up',
  '/authentication/forgot-password',
];

// Define routes that should redirect authenticated users to dashboard
const redirectToDashboardRoutes = ['/'];

interface DecodedToken {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

const isTokenExpired = (token: DecodedToken): boolean => {
  const currentTime = Math.floor(Date.now() / 1000);
  return token.exp < currentTime;
};

const isTokenValid = (token: string): boolean => {
  try {
    const decodedToken = jwtDecode<DecodedToken>(token);
    return !isTokenExpired(decodedToken);
  } catch (error) {
    return false;
  }
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Get the token from cookies
  const token = request.cookies.get('token')?.value;
  const isAuthenticated = token ? isTokenValid(token) : false;

  // If user is authenticated and trying to access landing page, redirect to dashboard
  if (isAuthenticated && redirectToDashboardRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If user is not authenticated and trying to access protected routes
  if (!isAuthenticated && !publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/authentication/sign-in', request.url));
  }

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
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|svgs|freelancers).*)',
  ],
};
