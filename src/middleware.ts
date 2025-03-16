import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get('auth_token')?.value;
  const path = request.nextUrl.pathname;

  // Public paths that don't require authentication
  const publicPaths = [
    '/', 
    '/auth/login', 
    '/auth/signup', 
    '/auth/verify-email'
  ];

  // Check if the path is public
  const isPublicPath = publicPaths.includes(path);

  // If trying to access a public path while logged in, redirect to dashboard
  if (isPublicPath && authToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If trying to access a protected path without authentication, redirect to login
  if (!isPublicPath && !authToken) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/auth/:path*'
  ]
}
