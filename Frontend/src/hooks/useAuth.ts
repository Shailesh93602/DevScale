import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Cookie from 'js-cookie';

export const useAuth = () => {
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'TOKEN_REFRESHED' && session) {
        Cookie.set('sb-access-token', session.access_token);
        Cookie.set('sb-refresh-token', session.refresh_token);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);
};
