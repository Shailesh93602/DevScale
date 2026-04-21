'use client';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { registerSchema } from '@/lib/validations';
import PasswordInput from '@/components/PasswordInput';
import { signup } from '@/app/auth/actions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const RegisterForm = () => {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(registerSchema),
  });

  const onSubmit = async (data: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    setServerError(null);
    setIsLoading(true);
    const formData = new FormData();
    formData.append('first_name', data.first_name);
    formData.append('last_name', data.last_name);
    formData.append('email', data.email);
    formData.append('password', data.password);
    const response = await signup(formData);
    setIsLoading(false);

    if (response?.success) {
      router.push('/auth/verify-email');
    } else if (response?.error) {
      setServerError(response.error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="register-first-name"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            First Name
          </label>
          <Input
            {...register('first_name')}
            id="register-first-name"
            placeholder="First Name"
            autoComplete="given-name"
            className="w-full"
            aria-invalid={!!errors.first_name}
          />
          {errors.first_name && (
            <p className="mt-1 text-sm text-destructive">
              {errors.first_name.message as string}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="register-last-name"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Last Name
          </label>
          <Input
            {...register('last_name')}
            id="register-last-name"
            placeholder="Last Name"
            autoComplete="family-name"
            className="w-full"
            aria-invalid={!!errors.last_name}
          />
          {errors.last_name && (
            <p className="mt-1 text-sm text-destructive">
              {errors.last_name.message as string}
            </p>
          )}
        </div>
      </div>
      <div>
        <label
          htmlFor="register-email"
          className="mb-2 block text-sm font-medium text-foreground"
        >
          Email
        </label>
        <Input
          {...register('email')}
          id="register-email"
          type="email"
          placeholder="Email"
          autoComplete="email"
          autoCorrect="off"
          spellCheck={false}
          className="w-full"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'register-email-error' : undefined}
        />
        {errors.email && (
          <p
            id="register-email-error"
            role="alert"
            className="mt-1 text-sm text-destructive"
          >
            {errors.email.message as string}
          </p>
        )}
      </div>
      <div>
        <label
          htmlFor="register-password"
          className="mb-2 block text-sm font-medium text-foreground"
        >
          Password
        </label>
        <PasswordInput
          register={register}
          name="password"
          id="register-password"
          placeholder="Password"
          autoComplete="new-password"
          error={errors.password?.message as string}
        />
      </div>
      <div>
        <label
          htmlFor="register-confirm-password"
          className="mb-2 block text-sm font-medium text-foreground"
        >
          Confirm Password
        </label>
        <PasswordInput
          register={register}
          name="confirmPassword"
          id="register-confirm-password"
          placeholder="Confirm Password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message as string}
        />
      </div>
      {serverError && (
        <p role="alert" className="text-sm text-destructive">
          {serverError}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Signing up...' : 'Sign up'}
      </Button>
    </form>
  );
};

export default RegisterForm;
