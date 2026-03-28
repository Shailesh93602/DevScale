'use client';
import RegisterForm from '../../auth/components/RegisterForm';
import Link from 'next/link';
import { motion } from 'framer-motion';
import OAuthProviders from '../../auth/components/OAuthProviders';

import { GuestGuard } from '@/components/guards/RouteGuards';

export default function RegisterPage() {
  return (
    <GuestGuard>
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
        <RegisterForm />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <OAuthProviders />

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link
            href="/auth/login"
            className="text-primary underline underline-offset-4"
          >
            Log in
          </Link>
        </div>
      </motion.div>
    </GuestGuard>
  );
}
