'use client';
import { useForm, type FieldValues } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { forgotPasswordSchema } from '@/lib/validations';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'react-toastify';
import { logger } from '@/lib/logger';

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(forgotPasswordSchema),
  });
  const supabase = createClient();

  const onSubmit = async (data: FieldValues) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) throw error;
      toast.success('Password reset email sent! Please check your inbox.');
    } catch (error) {
      logger.error('Error resetting password:', error);
      toast.error('Error resetting password. Please try again.');
    }
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <h1 className="mb-6 text-center text-3xl font-bold">Forgot Password</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="forgot-email" className="sr-only">
            Email
          </label>
          <Input
            {...register('email')}
            id="forgot-email"
            placeholder="Email"
            className="w-full"
            aria-label="Email address"
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p role="alert" className="mt-1 text-sm text-destructive">
              {errors.email.message as string}
            </p>
          )}
        </div>
        <Button type="submit" className="w-full">
          Reset Password
        </Button>
      </form>
      <div className="text-center text-sm text-muted-foreground">
        Remember your password?{' '}
        <Link href="/auth/login" className="text-primary underline underline-offset-4">
          Log in
        </Link>
      </div>
    </div>
  );
}
