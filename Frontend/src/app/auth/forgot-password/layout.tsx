import type { Metadata } from 'next';
import type React from 'react';

/**
 * Per-page metadata for the auth screens.
 *
 * `src/app/auth/layout.tsx` is a CLIENT component, so it cannot export
 * metadata — all three auth pages therefore shared the generic root title and
 * were indistinguishable in a tab strip, a bookmark list or browser history.
 *
 * A server layout nested inside that client layout is legal because `children`
 * is passed as a prop rather than imported, so this adds a title without
 * turning the shared shell back into a server component.
 */
export const metadata: Metadata = {
  title: 'Reset password',
  description: 'Reset your EduScale password.',
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
