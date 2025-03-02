'use client';
import { useForm, type FieldValues } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@/components/ui/button';
import { resetPasswordSchema } from '@/lib/validations';
import PasswordInput from '@/components/PasswordInput';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'react-toastify';

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: FieldValues) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });
      if (error) throw error;
      router.push('/auth/login');
      toast.success('Password updated successfully!');
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Error updating password. Please try again.');
    }
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <h1 className="mb-6 text-center text-3xl font-bold">Reset Password</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <PasswordInput
            register={register}
            name="password"
            placeholder="New Password"
            error={errors.password?.message as string}
          />
        </div>
        <div>
          <PasswordInput
            register={register}
            name="confirmPassword"
            placeholder="Confirm New Password"
            error={errors.confirmPassword?.message as string}
          />
        </div>
        <Button type="submit" className="w-full">
          Update Password
        </Button>
      </form>
    </div>
  );
}
