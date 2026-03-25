'use client';

import type React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md overflow-hidden rounded-lg bg-lightSecondary shadow-2xl">
        <div className="p-8">{children}</div>
      </div>
    </div>
  );
}
