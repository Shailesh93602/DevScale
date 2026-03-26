'use client';

import type React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 transition-colors">
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
        <div className="p-8 sm:p-10">{children}</div>
      </div>
    </div>
  );
}
