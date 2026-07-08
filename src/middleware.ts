import { type NextRequest, NextResponse } from 'next/server';

// Public routes that don't require auth
const PUBLIC_PATHS = ['/login', '/register', '/forgot-password', '/auth/github/callback'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + '/'),
  );

  if (isPublic) {
    return NextResponse.next();
  }

  // Edge Runtime: can only check cookie existence (cannot verify JWT signature)
  const hasToken = request.cookies.has('access_token');
  if (!hasToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all routes except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
