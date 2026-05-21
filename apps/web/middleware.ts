import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/cart', '/checkout', '/payment'],
};

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const token = req.cookies.get('token')?.value;

  const isLoggedIn = Boolean(token);

  /* ---------------- LOGIN PAGE ---------------- */
  if (path === '/login') {
    if (!isLoggedIn) return NextResponse.next();

    // Jika sudah login, JANGAN izinkan ke /login
    return NextResponse.redirect(new URL('/items', req.url));
  }

  /* ---------------- PROTECT DASHBOARD ---------------- */
  if (path.startsWith('/dashboard')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  /* ---------------- BUYER ONLY ---------------- */
  const buyerOnlyPages = ['/cart', '/checkout', '/payment'];
  if (buyerOnlyPages.some((p) => path.startsWith(p))) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return NextResponse.next();
}
