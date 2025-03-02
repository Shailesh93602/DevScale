import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/client';
import { useState } from 'react';
import { FaGoogle, FaGithub, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';

type Provider = 'google' | 'github' | 'azure';

export default function OAuthProviders() {
  const supabase = createClient();
  const [loadingProvider, setLoadingProvider] = useState<Provider | null>(null);

  const handleOAuth = async (provider: Provider) => {
    setLoadingProvider(provider);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error('OAuth error:', error);
      setLoadingProvider(null);
      toast.error('Error logging in. Please try again.');
    }
  };

  return (
    <div className="grid grid-cols-1 gap-3">
      <Button
        variant="outline"
        onClick={() => handleOAuth('google')}
        disabled={!!loadingProvider}
        className="flex items-center justify-center gap-2"
      >
        {loadingProvider === 'google' ? (
          <FaSpinner className="h-4 w-4 animate-spin" />
        ) : (
          <FaGoogle className="h-5 w-5" />
        )}
        Google
      </Button>

      <Button
        variant="outline"
        onClick={() => handleOAuth('github')}
        disabled={!!loadingProvider}
        className="flex items-center justify-center gap-2"
      >
        {loadingProvider === 'github' ? (
          <FaSpinner className="h-4 w-4 animate-spin" />
        ) : (
          <FaGithub className="h-5 w-5" />
        )}
        GitHub
      </Button>
    </div>
  );
}
