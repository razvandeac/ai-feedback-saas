import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the session token from cookies
  const sessionToken = request.cookies.get('pulseai-auth-token');

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // Public routes that should redirect to dashboard if authenticated
  const authRoutes = ['/login'];
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // If accessing a protected route without a session, redirect to login
  if (isProtectedRoute && !sessionToken) {
    const url = new URL('/login', request.url);
    return NextResponse.redirect(url);
  }

  // If accessing login while authenticated, redirect to dashboard
  if (isAuthRoute && sessionToken) {
    const url = new URL('/dashboard', request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

