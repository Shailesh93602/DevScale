'use client';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { createClient } from '@/utils/supabase/client';

export default function VerifyEmailPage() {
  const params = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const verifyEmail = async () => {
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          toast.error('Email verification failed');
          return;
        }
        toast.success('Email verified successfully!');
      }
    };

    verifyEmail();
  }, [params]);

  return (
    <div className="p-8 text-center">
      <h1 className="mb-4 text-2xl font-bold">Verifying Email...</h1>
      <p>Please wait while we confirm your email address.</p>
    </div>
  );
}
