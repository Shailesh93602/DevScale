import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // if "next" is in search params, use it as the redirect URL after login
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Stay on the same domain that initiated the request
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Redirect back to login with a generic error code if exchange fails
  return NextResponse.redirect(`${origin}/auth/login?error=OAuthCallbackError`);
}
