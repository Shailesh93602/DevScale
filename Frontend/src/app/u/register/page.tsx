'use client';
import { useState } from 'react';
import { type FieldValues, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setUser } from '@/lib/features/user/userSlice';
import Image from 'next/image';
import { registerSchema } from '../validations';
import RegisterForm from '../components/RegistrationForm';
import { useMediaQuery } from '@/hooks/use-media-query';
import customAxios from '@/app/services/customAxios';
import AnimatedBackground from '@/components/AnimatedBackground';
import { motion } from 'framer-motion';

const RegisterPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const isSmallScreen = useMediaQuery('(max-width:960px)');

  const form = useForm({
    resolver: yupResolver(registerSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: FieldValues) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const response = await customAxios.post('/auth/register', data);

      if (response.data?.success) {
        dispatch(setUser(response.data.user));
        toast.success('Registered Successfully!');

        document.cookie = `token=${response.data.token};expires=${new Date(
          Date.now() + 100 * 60 * 60 * 1000,
        ).toUTCString()};path=/;`;

        router.push('/dashboard');
      } else {
        toast.error(
          response.data?.message || 'Registration failed. Please try again.',
        );
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('An unexpected error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center overflow-hidden p-4">
      <AnimatedBackground />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-card/80 shadow-xl backdrop-blur-lg lg:flex-row"
      >
        <div className="relative flex flex-col items-center justify-center p-8 lg:w-1/2">
          <motion.h4
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-4 text-2xl font-bold text-foreground"
          >
            Mr.Engineer
          </motion.h4>
          {!isSmallScreen && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
            >
              <Image
                src="/images/boy-with-rocket-dark.png"
                alt="Illustration"
                width={300}
                height={300}
                className="object-contain"
              />
            </motion.div>
          )}
        </div>
        <div className="flex flex-col justify-center p-8 lg:w-1/2">
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mx-auto w-full max-w-md space-y-6"
          >
            <h4 className="text-2xl font-bold text-foreground">
              Adventure starts here 🚀
            </h4>
            <p className="mb-6 text-muted-foreground">
              Make your app management easy and fun!
            </p>
            <RegisterForm
              form={form}
              onSubmit={onSubmit}
              isLoading={isLoading}
            />
            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <a href="/auth/login" className="text-primary hover:underline">
                Sign in instead
              </a>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
