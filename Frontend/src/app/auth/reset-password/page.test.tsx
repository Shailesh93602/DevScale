import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('@/utils/supabase/client', () => ({
  createClient: () => ({ auth: { updateUser: vi.fn() } }),
}));

// forgot-password sends the recovery email to /auth/reset-password. The App
// Router only creates that route from a file named page.tsx; the form used to
// live in index.tsx, so the link 404'd. Importing './page' fails if it moves.
import Page from './page';
import { metadata } from './layout';

describe('/auth/reset-password', () => {
  it('is a real route that renders the new-password form', () => {
    render(<Page />);
    expect(
      screen.getByRole('heading', { name: 'Reset Password' }),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText('New Password')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Confirm New Password'),
    ).toBeInTheDocument();
    expect(metadata.title).toBe('Choose a new password');
  });
});
