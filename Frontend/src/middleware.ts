import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const protectedPages = [
  '/dashboard',
  '/profile',
  '/resources',
  '/coding-challenges',
  '/career-roadmap',
  '/placement-preparation',
  '/community',
  '/achievements',
  '/battle-zone',
  '/create-resource',
  '/article-listing',
];

export async function middleware(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const accessToken = request.cookies.get('sb-access-token')?.value;

  if (!accessToken && !request.nextUrl.pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  if (accessToken) {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    if (request.nextUrl.pathname.startsWith('/auth')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  const pathname = request.nextUrl.pathname;

  if (!protectedPages.includes(pathname)) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard',
    '/profile',
    '/resources',
    '/coding-challenges',
    '/career-roadmap',
    '/placement-preparation',
    '/community',
    '/achievements',
    '/battle-zone',
    '/create-resource',
    '/article-listing',
  ],
};
