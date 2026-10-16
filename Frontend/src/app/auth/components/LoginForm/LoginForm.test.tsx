import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const h = vi.hoisted(() => ({ params: new URLSearchParams() }));
vi.mock('next/navigation', () => ({ useSearchParams: () => h.params }));
vi.mock('@/app/auth/actions', () => ({
  login: async () => ({ success: true }),
}));

import LoginForm from './index';

const assign = vi.fn();

async function loginWith(callbackUrl: string) {
  h.params = new URLSearchParams({ callbackUrl });
  render(<LoginForm />);
  fireEvent.change(screen.getByLabelText('Email'), {
    target: { value: 'student@example.com' },
  });
  fireEvent.change(screen.getByLabelText('Password'), {
    target: { value: 'Password123!' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
  await waitFor(() => expect(assign).toHaveBeenCalled());
  return assign.mock.calls[0][0];
}

describe('LoginForm post-login redirect', () => {
  beforeEach(() => {
    assign.mockReset();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...window.location, assign },
    });
  });

  it.each([
    '//evil.example',
    '/\\evil.example',
    '/.//evil.example',
    '/..//evil.example',
    '/%2e%2e//evil.example',
  ])('refuses the protocol-relative callbackUrl %j', async (cb) => {
    expect(await loginWith(cb)).toBe('/dashboard');
  });

  it('returns to a same-origin page', async () => {
    expect(await loginWith('/instant-battle')).toBe('/instant-battle');
  });

  it('never returns to an auth page', async () => {
    expect(await loginWith('/auth/register')).toBe('/dashboard');
  });
});
