import { useForm, type FieldValues } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { registerSchema } from '../../validations';
import { supabase } from '@/lib/supabaseClient';
import PasswordInput from '@/components/PasswordInput';

interface RegisterFormProps {
  onSuccess: () => void;
}

const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(registerSchema),
  });

  const onSubmit = async (data: FieldValues) => {
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
          },
        },
      });
      if (error) throw error;
      onSuccess();
    } catch (error) {
      console.error('Error registering:', error);
      // Handle error (show toast, etc.)
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
      <Button type="submit" className="w-full">
        Sign up
      </Button>
    </form>
  );
};

export default RegisterForm;
