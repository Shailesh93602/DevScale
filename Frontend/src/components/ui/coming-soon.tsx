'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from './button';

interface ComingSoonProps {
  title: string;
  description?: string;
}

export const ComingSoon: React.FC<ComingSoonProps> = ({
  title,
  description = "We're working hard to bring you this feature. Stay tuned!",
}) => {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-background p-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="bg-primary/20 h-24 w-24 animate-pulse rounded-full blur-2xl" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl">🚀</span>
            </div>
          </div>
        </div>
        <h1 className="mb-4 text-4xl font-bold text-foreground md:text-5xl">
          {title}
        </h1>
        <p className="mx-auto mb-8 max-w-md text-lg text-muted-foreground">
          {description}
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/">
            <Button size="lg">Back to Home</Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg">Go to Dashboard</Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
