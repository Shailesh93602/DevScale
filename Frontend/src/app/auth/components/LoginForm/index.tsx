'use client';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { loginSchema } from '@/lib/validations';
import Link from 'next/link';
import PasswordInput from '@/components/PasswordInput';
import { login } from '@/app/auth/actions';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const LoginForm = () => {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data: {
    email: string;
    password: string;
  }) => {
    setServerError(null);
    setIsLoading(true);
    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('password', data.password);
    const response = await login(formData);
    setIsLoading(false);

    if (response?.success) {
      router.push('/');
    } else if (response?.error) {
      setServerError(response.error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input {...register('email')} placeholder="Email" className="w-fu" />
        {errors.email && (
          <p className="mt-1 text-sm text-destructive">
            {errors.email.message as string}
          </p>
        )}
      </div>
      <div>
        <PasswordInput
          register={register}
          name="password"
          placeholder="Password"
          error={errors.password?.message as string}
        />
      </div>
      {serverError && (
        <p className="text-sm text-destructive">{serverError}</p>
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
        {isLoading ? 'Logging in...' : 'Log in'}
      </Button>
    </form>
  );
};

export default LoginForm;
