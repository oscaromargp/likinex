import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedPaths = ['/app'];
const apiProtectedPaths = ['/api'];
const publicApiPaths = ['/api/notifications', '/api/migrate'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('sb-tmcqyscstxlilfbsdcwn-auth-token');

  const isProtectedPage = protectedPaths.some(
    path => pathname === path || pathname.startsWith(`${path}/`)
  );

  const isProtectedApi = apiProtectedPaths.some(
    path => pathname === path || pathname.startsWith(`${path}/`)
  );

  const isPublicApi = publicApiPaths.some(
    path => pathname === path || pathname.startsWith(`${path}/`)
  );

  if (isProtectedApi && !isPublicApi && !sessionCookie) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  if (isProtectedPage && !sessionCookie) {
    const authUrl = new URL('/auth', request.url);
    authUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(authUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/app/:path*', '/api/:path*'],
};
