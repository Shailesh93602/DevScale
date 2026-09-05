import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// vi.mock is hoisted above every import and const, so anything a factory
// closes over has to be hoisted with it.
const { push, toastInfo, auth } = vi.hoisted(() => ({
  push: vi.fn(),
  toastInfo: vi.fn(),
  auth: {
    state: { isAuthenticated: false, status: 'unauthenticated' } as {
      isAuthenticated: boolean;
      status: string;
    },
  },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  usePathname: () => '/career-roadmap/some-roadmap',
}));
vi.mock('react-toastify', () => ({ toast: { info: toastInfo } }));
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => auth.state }));

import { useSignInGate } from './useSignInGate';

beforeEach(() => {
  push.mockReset();
  toastInfo.mockReset();
});

describe('useSignInGate', () => {
  it('sends a visitor to login with a callbackUrl back to the current page, and says why', () => {
    auth.state = { isAuthenticated: false, status: 'unauthenticated' };
    const { result } = renderHook(() => useSignInGate());

    let allowed = true;
    act(() => {
      allowed = result.current.requireSignIn('like roadmaps');
    });

    expect(allowed).toBe(false);
    expect(push).toHaveBeenCalledWith(
      '/auth/login?callbackUrl=%2Fcareer-roadmap%2Fsome-roadmap',
    );
    expect(toastInfo).toHaveBeenCalledWith(
      'Sign in to like roadmaps.',
      expect.objectContaining({ toastId: expect.any(String) }),
    );
  });

  it('lets a member through without redirecting', () => {
    auth.state = { isAuthenticated: true, status: 'authenticated' };
    const { result } = renderHook(() => useSignInGate());
    expect(result.current.requireSignIn('enrol')).toBe(true);
    expect(push).not.toHaveBeenCalled();
    expect(toastInfo).not.toHaveBeenCalled();
  });

  it('does not block while auth is still resolving (the backend still decides)', () => {
    auth.state = { isAuthenticated: false, status: 'loading' };
    const { result } = renderHook(() => useSignInGate());
    expect(result.current.requireSignIn('bookmark')).toBe(true);
    expect(push).not.toHaveBeenCalled();
  });
});
