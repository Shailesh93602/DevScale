'use client';
import { useRouter } from 'next/navigation';
import RegisterForm from '../components/RegisterForm';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  const router = useRouter();

  const handleAuthSuccess = async () => {
    // Implement your logic here
    router.push('/auth/details');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="mx-auto w-full max-w-md space-y-6"
    >
      <h1 className="text-center text-3xl font-bold">
        Join Our Learning Community
      </h1>
      <RegisterForm onSuccess={handleAuthSuccess} />
      <div className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-primary hover:underline">
          Log in
        </Link>
      </div>
    </motion.div>
  );
}
