import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const { pathname } = request.nextUrl;

  // Check if the request is for admin routes
  if (pathname.startsWith('/admin')) {
    // Get the auth token from cookies
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      // Redirect to login if no token
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Note: We can't decode JWT here without the secret, so we'll rely on
    // the component-level protection in the admin pages
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};