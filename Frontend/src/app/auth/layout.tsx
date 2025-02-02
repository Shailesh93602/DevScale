import type React from 'react';
import { FaGoogle, FaGithub, FaTwitter } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const handleSocialLogin = async (
    provider: 'google' | 'github' | 'twitter',
  ) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider });
      if (error) throw error;
    } catch (error) {
      console.error('Error with social login:', error);
      // Handle error (show toast, etc.)
    }
  };

  return (
    <div className="from-lightSecondary/20 to-light/20 dark:from-primary/20 flex min-h-screen items-center justify-center bg-gradient-to-br p-4 dark:to-secondary/20">
      <div className="w-full max-w-md overflow-hidden rounded-lg bg-background shadow-2xl">
        <div className="p-8">
          {children}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <div className="mt-6 flex justify-center space-x-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleSocialLogin('google')}
              >
                <FaGoogle className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleSocialLogin('github')}
              >
                <FaGithub className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleSocialLogin('twitter')}
              >
                <FaTwitter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
