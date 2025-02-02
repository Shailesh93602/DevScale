'use client';
import { useRouter } from 'next/navigation';
import LoginForm from '../components/LoginForm';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();

  const handleAuthSuccess = async () => {
    // Implement your logic here
    router.push('/dashboard');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="mx-auto w-full max-w-md space-y-6"
    >
      <h1 className="text-center text-3xl font-bold">Welcome Back!</h1>
      <LoginForm onSuccess={handleAuthSuccess} />
      <div className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href="/auth/register" className="text-primary hover:underline">
          Sign up
        </Link>
      </div>
    </motion.div>
  );
}
