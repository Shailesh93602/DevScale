'use client';

import { ErrorState } from '@/components/ui/error-state';

export default function ErrorPage() {
  return (
    <ErrorState
      fullPage
      title="Something went wrong"
      message="An unexpected error occurred. Please try refreshing the page or go back to the dashboard."
      onRetry={() => window.location.reload()}
    />
  );
}
