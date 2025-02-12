import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse, NextRequest } from 'next/server';
import customAxios from './app/services/customAxios';

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

export async function middleware(req: NextRequest, res: NextResponse) {
  const supabase = createMiddlewareClient({ req, res });
  const pathname = req.nextUrl.pathname;

  if (!protectedPages.includes(pathname)) {
    return NextResponse.next();
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return redirectToLogin(req);
  }

  try {
    const data = await customAxios.get('/get-logged-in-user', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (!data) {
      return NextResponse.redirect((req.nextUrl.clone().pathname = '/details'));
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
