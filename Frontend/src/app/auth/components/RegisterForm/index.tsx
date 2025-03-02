'use client';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { registerSchema } from '@/lib/validations';
import PasswordInput from '@/components/PasswordInput';
import { signup } from '@/app/auth/actions';

const RegisterForm = () => {
  const {
    register,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(registerSchema),
  });

  return (
    <form className="space-y-4">
      <div>
        <Input
          {...register('name')}
          placeholder="Full Name"
          className="w-full"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-destructive">
            {errors.name.message as string}
          </p>
        )}
      </div>
      <div>
        <Input {...register('email')} placeholder="Email" className="w-full" />
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
      <div>
        <PasswordInput
          register={register}
          name="confirmPassword"
          placeholder="Confirm Password"
          error={errors.confirmPassword?.message as string}
        />
      </div>
      <Button type="submit" className="w-full" formAction={signup}>
        Sign up
      </Button>
    </form>
  );
};

export default RegisterForm;
