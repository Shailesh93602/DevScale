import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const h = vi.hoisted(() => ({ setSession: vi.fn() }));
vi.mock('@/utils/supabase/client', () => ({
  createClient: () => ({ auth: { setSession: h.setSession } }),
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () =>
    new URLSearchParams({
      access_token: 'attacker-access',
      refresh_token: 'attacker-refresh',
    }),
}));
vi.mock('react-toastify', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import VerifyEmailPage from './page';

describe('/auth/verify-email', () => {
  it('ignores tokens in the query string instead of installing them as the session', async () => {
    render(<VerifyEmailPage />);
    await new Promise((r) => setTimeout(r, 0));
    expect(h.setSession).not.toHaveBeenCalled();
    expect(
      screen.getByRole('heading', { name: 'Check Your Email' }),
    ).toBeInTheDocument();
  });
});
