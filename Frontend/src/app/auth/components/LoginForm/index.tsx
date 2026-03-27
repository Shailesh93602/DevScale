'use client';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { loginSchema, LoginFormData } from '@/lib/validations';
import Link from 'next/link';
import PasswordInput from '@/components/PasswordInput';
import { login } from '@/app/auth/actions';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

const LoginForm = () => {
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    setIsLoading(true);
    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('password', data.password);

    const response = await login(formData);

    setIsLoading(false);

    if (response?.success) {
      const callbackUrl = searchParams.get('callbackUrl');
      const isValidCallback =
        callbackUrl &&
        callbackUrl.startsWith('/') &&
        !callbackUrl.startsWith('/auth');

      // Use a hard redirect to completely bypass Next.js client-side Suspense locking bugs 
      // and ensure the new Server Cookie is firmly established before mounting the dashboard.
      globalThis.window.location.assign(isValidCallback ? callbackUrl : '/dashboard');
    } else if (response?.error) {
      setServerError(response.error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label
          htmlFor="login-email"
          className="mb-2 block text-sm font-medium text-foreground"
        >
          Email
        </label>
        <Input
          {...register('email')}
          id="login-email"
          type="email"
          placeholder="you@example.com"
          className="w-full"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-destructive">
            {errors.email.message as string}
          </p>
        )}
      </div>
      <div>
        <label
          htmlFor="login-password"
          className="mb-2 block text-sm font-medium text-foreground"
        >
          Password
        </label>
        <PasswordInput
          register={register}
          name="password"
          id="login-password"
          placeholder="••••••••"
          error={errors.password?.message as string}
        />
      </div>
      {serverError && (
        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {serverError}
        </p>
      )}
      <div className="flex items-center justify-between">
        <Link
          href="/auth/forgot-password"
          className="text-sm text-primary hover:underline"
        >
          Forgot password?
        </Link>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  );
};

export default LoginForm;
