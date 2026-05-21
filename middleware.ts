import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedPaths = ['/app'];
const publicApiPaths = ['/api/notifications', '/api/migrate', '/api/seed'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware entirely for demo mode
  if (request.nextUrl.searchParams.get('demo') === 'true') {
    return NextResponse.next({ request });
  }

  const isProtectedPage = protectedPaths.some(
    path => pathname === path || pathname.startsWith(`${path}/`)
  );

  const isProtectedApi = pathname.startsWith('/api/') && !publicApiPaths.some(p => pathname.startsWith(p));

  if (!isProtectedPage && !isProtectedApi) {
    return NextResponse.next({ request });
  }

  // Auto-redirect to demo mode when Supabase is not configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey || supabaseUrl === 'https://placeholder-url.supabase.co') {
    if (isProtectedPage) {
      const demoUrl = new URL('/app', request.url);
      demoUrl.searchParams.set('demo', 'true');
      if (pathname !== '/app') demoUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(demoUrl);
    }
    if (isProtectedApi) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
    }
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const { createServerClient } = await import('@supabase/ssr');
  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  if (isProtectedApi && !session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (isProtectedPage && !session) {
    const authUrl = new URL('/auth', request.url);
    authUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(authUrl);
  }

  return response;
}

export const config = {
  matcher: ['/app/:path*', '/api/:path*'],
};
