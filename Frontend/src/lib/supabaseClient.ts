import { createClient } from '@supabase/supabase-js';
import Cookie from 'js-cookie';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: false,
      detectSessionInUrl: false,
    },
  },
);

// Client-side only auth state handling
supabase.auth.onAuthStateChange((event, session) => {
  if (typeof window === 'undefined') return;

  switch (event) {
    case 'SIGNED_IN':
    case 'TOKEN_REFRESHED':
      if (session) {
        Cookie.set('sb-access-token', session.access_token, {
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        });
        Cookie.set('sb-refresh-token', session.refresh_token, {
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        });
      }
      break;

    case 'SIGNED_OUT':
      Cookie.remove('sb-access-token');
      Cookie.remove('sb-refresh-token');
      break;
  }
});
