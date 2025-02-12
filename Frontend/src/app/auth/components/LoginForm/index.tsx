'use client';
import { useForm, type FieldValues } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { loginSchema } from '@/lib/validations';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import PasswordInput from '@/components/PasswordInput';
import { toast } from 'react-toastify';

interface LoginFormProps {
  onSuccess: () => void;
}

const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data: FieldValues) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (error) {
        if (error.code === 'email_not_confirmed') {
          toast.error('Please verify your email address to continue');
          return;
        }

        toast.error('Invalid email or password');
        return;
      }
      onSuccess();
    } catch (error) {
      console.error('Error logging in:', error);
      // Handle error (show toast, etc.)
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
      <div className="flex items-center justify-between">
        <Link
          href="/auth/forgot-password"
          className="text-sm text-primary hover:underline"
        >
          Forgot password?
        </Link>
      </div>
      <Button type="submit" className="w-full">
        Log in
      </Button>
    </form>
  );
};

export default LoginForm;
