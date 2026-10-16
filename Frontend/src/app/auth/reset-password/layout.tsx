import type { Metadata } from 'next';
import type React from 'react';

// Server layout for metadata only; see auth/forgot-password/layout.tsx.
export const metadata: Metadata = {
  title: 'Choose a new password',
  description: 'Set a new password for your EduScale account.',
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
