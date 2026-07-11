import { type NextRequest, NextResponse } from 'next/server';

// Public routes that don't require auth
const PUBLIC_PATHS = ['/login', '/register', '/forgot-password', '/auth/github/callback'];

// Level 1 (coarse) role gate: route prefix -> required role. Fine-grained permission-key
// checks happen at the page level (see TASK-PERM-0006), this is only a first-pass guard.
const ROLE_ROUTES: Array<{ prefix: string; role: string }> = [{ prefix: '/admin', role: 'admin' }];

interface JwtPayload {
  sub?: number;
  email?: string;
  roles?: string[];
}

/**
 * Decodes the JWT payload without verifying the signature — Edge Runtime cannot run
 * Node's crypto verification. The signature IS verified downstream by BFF on every actual
 * API call, so this is only used for a fast, best-effort UX redirect.
 */
function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const [, payloadSegment] = token.split('.');
    if (!payloadSegment) return null;
    const base64 = payloadSegment.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic =
    pathname === '/403' ||
    PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(path + '/'));

  if (isPublic) {
    return NextResponse.next();
  }

  // Edge Runtime: can only check cookie existence (cannot verify JWT signature)
  const token = request.cookies.get('access_token')?.value;
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const payload = decodeJwtPayload(token);
  if (!payload) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const matched = ROLE_ROUTES.find((r) => pathname.startsWith(r.prefix));
  if (matched && !payload.roles?.includes(matched.role)) {
    return NextResponse.redirect(new URL('/403', request.url));
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
