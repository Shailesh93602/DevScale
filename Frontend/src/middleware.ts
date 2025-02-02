import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const pathname = req.nextUrl.pathname;

  if (!protectedPages.includes(pathname)) {
    return res;
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return redirectToLogin(req);
  }

  try {
    const { data: profileData, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error || !profileData) {
      throw new Error('Profile not found');
    }

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    return redirectToLogin(req);
  }
}

function redirectToLogin(req: NextRequest) {
  const redirectUrl = req.nextUrl.clone();
  redirectUrl.pathname = '/auth/login';
  redirectUrl.searchParams.set(`redirectedFrom`, req.nextUrl.pathname);
  return NextResponse.redirect(redirectUrl);
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
