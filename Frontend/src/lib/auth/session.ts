import { Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';

export const syncAuthState = (
  callback: (event: AuthChangeEvent, session: Session | null) => void,
) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
      // Clear client-side cookies
      document.cookie =
        'sb-access-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      document.cookie =
        'sb-refresh-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
    callback(event, session);
  });
};
