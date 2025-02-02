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
  username: yup
    .string()
    .trim()
    .required('Username is required')
    .min(2, 'Username must be at least 2 characters.'),
});

export default function ForgotPassword() {
  const form = useForm({
    resolver: yupResolver(formSchema),
    mode: 'onChange',
  });

  const router = useRouter();

  const onSubmit = async (data: FieldValues) => {
    try {
      const response = await fetchData(
        'POST',
        '/auth/forgot',
        JSON.stringify(data),
      );
      if (response.data.success) {
        toast.success(data.message);
        setTimeout(() => {
          router.push('/u/login');
        }, 1000);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong');
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
          Forgot Password
        </h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <CustomInput
              control={form.control}
              errors={form.formState.errors}
              name="username"
              label="Username"
              placeholder="Enter your Username"
            />
            <Button
              type="submit"
              className="mt-4 w-full bg-blue-600 py-3 text-white transition duration-200 ease-in-out hover:bg-blue-700"
            >
              Submit
            </Button>
            <div className="mt-4 text-center text-sm text-muted-foreground dark:text-gray-400">
              <p>
                Don&apos;t have an account?{' '}
                <Link
                  href="/u/register"
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  Create one
                </Link>
              </p>
            </div>
          </form>
        </Form>
      </div>
    </section>
  );
}
