import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('auth_token');

  // Protected routes
  const protectedRoutes = ['/dashboard', '/api/dashboard'];

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  // Authentication routes
  const authRoutes = ['/auth/login', '/auth/signup'];

  // Redirect logic
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Prevent logged-in users from accessing login/signup pages
  if (authRoutes.includes(request.nextUrl.pathname) && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Specify which routes this middleware should run on
export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/auth/login', 
    '/auth/signup',
    '/api/dashboard/:path*'
  ]
}
