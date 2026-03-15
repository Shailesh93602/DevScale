'use client';
import { useCallback, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { createClient } from '@/utils/supabase/client';
import { FaSpinner } from 'react-icons/fa';

export default function VerifyEmailPage() {
  const params = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<
    'verifying' | 'success' | 'error' | 'waiting'
  >('waiting');

  const verifyEmail = useCallback(async () => {
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (!accessToken || !refreshToken) {
      setStatus('waiting');
      return;
    }

    setStatus('verifying');
    const supabase = createClient();
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error) {
      setStatus('error');
      toast.error('Email verification failed. Please try again.');
      return;
    }

    setStatus('success');
    toast.success('Email verified successfully!');
    setTimeout(() => router.push('/dashboard'), 2000);
  }, [params, router]);

  useEffect(() => {
    if (status === 'waiting') {
      verifyEmail();
    }
  }, [verifyEmail, status]);

  return (
    <div className="p-8 text-center">
      {status === 'verifying' && (
        <>
          <FaSpinner
            className="mx-auto mb-4 h-8 w-8 animate-spin text-primary"
            aria-hidden="true"
          />
          <h1 className="mb-4 text-2xl font-bold">Verifying Email...</h1>
          <p className="text-muted-foreground">
            Please wait while we confirm your email address.
          </p>
        </>
      )}
      {status === 'waiting' && (
        <>
          <h1 className="mb-4 text-2xl font-bold">Check Your Email</h1>
          <p className="text-muted-foreground">
            We&apos;ve sent a verification link to your email. Click the link to
            verify your account.
          </p>
        </>
      )}
      {status === 'success' && (
        <>
          <h1 className="text-green-600 mb-4 text-2xl font-bold">
            Email Verified!
          </h1>
          <p className="text-muted-foreground">
            Redirecting to your dashboard...
          </p>
        </>
      )}
      {status === 'error' && (
        <>
          <h1 className="mb-4 text-2xl font-bold text-destructive">
            Verification Failed
          </h1>
          <p className="text-muted-foreground">
            The verification link may have expired.{' '}
            <a href="/auth/login" className="text-primary hover:underline">
              Try logging in
            </a>{' '}
            or request a new verification email.
          </p>
        </>
      )}
    </div>
  );
}
