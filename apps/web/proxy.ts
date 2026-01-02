import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Next.js 16 requires "proxy" function name
export async function proxy(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;

  // For database sessions, check the session cookie directly
  const sessionToken = request.cookies.get('next-auth.session-token')?.value || 
                       request.cookies.get('__Secure-next-auth.session-token')?.value;
  
  const isAuth = !!sessionToken;

  // Define route types
  const isApiAuthRoute = pathname.startsWith('/api/auth');
  const isAuthPage = pathname.startsWith('/login') && !pathname.startsWith('/login/verify');
  const isVerifyPage = pathname.startsWith('/login/verify');
  const isDashboard = pathname.startsWith('/dashboard');
  const isAdmin = pathname.startsWith('/admin');
  
  const publicRoutes = [
    '/',
    '/search',
    '/assets',
    '/category',
    '/terms',
    '/privacy',
    '/dmca',
    '/licenses',
    '/about',
    '/pricing',
    '/user',
  ];

  const isPublicRoute = publicRoutes. some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // 1. Allow all API auth routes (NextAuth handles these)
  if (isApiAuthRoute) {
    return NextResponse. next();
  }

  // 2. Allow verify page (for magic link flow)
  if (isVerifyPage) {
    return NextResponse.next();
  }

  // 3. Allow all public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // 4. Redirect authenticated users away from login page
  if (isAuthPage && isAuth) {
    return NextResponse.redirect(new URL('/dashboard', origin));
  }

  // 5. Protect dashboard routes
  if (isDashboard && !isAuth) {
    const loginUrl = new URL('/login', origin);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 6. Protect admin routes
  if (isAdmin) {
    if (!isAuth) {
      const loginUrl = new URL('/login', origin);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Admin check will happen on the server side since we can't verify from cookie alone
  }

  // 7. Allow everything else
  return NextResponse.next();
}

// Configure matcher to exclude static files
export const config = {
  matcher:  [
    /*
     * Match all request paths except: 
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};