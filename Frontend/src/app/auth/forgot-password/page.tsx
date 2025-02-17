'use client';
import { useForm, type FieldValues } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { forgotPasswordSchema } from '@/lib/validations';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

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
      // Handle success (e.g., show success message)
    } catch (error) {
      console.error('Error resetting password:', error);
      // Handle error (show toast, etc.)
    }
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <h1 className="mb-6 text-center text-3xl font-bold">Forgot Password</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input
            {...register('email')}
            placeholder="Email"
            className="w-full"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-destructive">
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
        <Link href="/auth/login" className="text-primary hover:underline">
          Log in
        </Link>
      </div>
    </div>
  );
}
