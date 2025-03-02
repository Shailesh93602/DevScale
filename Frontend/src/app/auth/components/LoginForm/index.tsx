'use client';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { loginSchema } from '@/lib/validations';
import Link from 'next/link';
import PasswordInput from '@/components/PasswordInput';
import { login } from '@/app/auth/actions';

const LoginForm = () => {
  const {
    register,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  return (
    <form className="space-y-4">
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
      <Button type="submit" className="w-full" formAction={login}>
        Log in
      </Button>
    </form>
  );
};

export default LoginForm;
