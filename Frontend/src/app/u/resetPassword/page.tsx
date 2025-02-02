'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { FieldValues, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Form } from '@/components/ui/form';
import CustomInput from '@/components/common/customInput';
import { fetchData } from '@/app/services/fetchData';

const formSchema = yup.object({
  password: yup
    .string()
    .trim()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
  confirmPassword: yup.string().trim().required('Confirm Password is required'),
});

export default function Login() {
  const form = useForm({
    resolver: yupResolver(formSchema),
    mode: 'onChange',
  });

  const router = useRouter();

  const onSubmit = async (data: FieldValues) => {
    try {
      const response = await fetchData(
        'POST',
        '/auth/reset',
        JSON.stringify(data),
      );
      if (response?.data?.success) {
        toast.success('Password changed Successfully!');
        setTimeout(() => {
          router.push('/u/login');
        }, 1000);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong.');
    }
  };

  return (
    <section className="flex min-h-screen items-center justify-center bg-background py-12 text-foreground transition duration-300 ease-in-out">
      <div className="w-full max-w-lg rounded-lg bg-card p-10 shadow-lg dark:bg-gray-800 dark:text-white">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="text-4xl font-extrabold text-blue-700 dark:text-blue-800"
          >
            Mr. Engineers
          </Link>
        </div>
        <h1 className="mb-6 text-center text-3xl font-semibold dark:text-gray-100">
          Reset Password
        </h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <CustomInput
              control={form.control}
              errors={form.formState.errors}
              name="password"
              type="password"
              label="Password"
              placeholder="Enter your Password"
            />
            <CustomInput
              control={form.control}
              errors={form.formState.errors}
              name="confirmPassword"
              type="password"
              label="Confirm Password"
              placeholder="Enter your Password again"
            />
            <Button
              type="submit"
              className="mt-4 w-full bg-blue-600 py-3 text-white transition duration-200 ease-in-out hover:bg-blue-700"
            >
              Login
            </Button>
            <div className="mt-4 text-center text-sm text-muted-foreground dark:text-gray-400">
              <p>
                Know your password?{' '}
                <Link
                  href="/u/register"
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  Login here
                </Link>
              </p>
            </div>
          </form>
        </Form>
      </div>
    </section>
  );
}
