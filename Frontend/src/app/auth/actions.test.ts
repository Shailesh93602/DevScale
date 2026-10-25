import { beforeEach, describe, expect, it, vi } from 'vitest';

const signUp = vi.fn();

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/utils/supabase/server', () => ({
  createClient: async () => ({ auth: { signUp } }),
}));

import { signup } from './actions';

const form = (email: string) => {
  const fd = new FormData();
  fd.append('email', email);
  fd.append('password', 'Str0ng!pass');
  fd.append('first_name', 'A');
  fd.append('last_name', 'B');
  return fd;
};

const authError = (code: string, message: string) => ({
  data: { user: null, session: null },
  error: Object.assign(new Error(message), { code, status: 422 }),
});

describe('signup', () => {
  beforeEach(() => signUp.mockReset());

  it('answers an existing email exactly as it answers a new one', async () => {
    signUp.mockResolvedValueOnce({ data: { user: {} }, error: null });
    const fresh = await signup(form('new@example.com'));

    signUp.mockResolvedValueOnce(
      authError('user_already_exists', 'User already registered'),
    );
    const existing = await signup(form('taken@example.com'));

    expect(existing).toEqual(fresh);
    expect(existing).toEqual({ success: true });
    expect(JSON.stringify(existing)).not.toMatch(/registered|exists/i);
  });

  it.each([
    ['email_exists', 'Email address already exists'],
    ['', 'User already registered'],
  ])('hides the existence error %j', async (code, message) => {
    signUp.mockResolvedValueOnce(authError(code, message));
    expect(await signup(form('taken@example.com'))).toEqual({
      success: true,
    });
  });

  it.each([
    ['weak_password', 'Password should be at least 8 characters.'],
    ['email_address_invalid', 'Email address "x@y" is invalid'],
  ])('keeps the real validation error %j', async (code, message) => {
    signUp.mockResolvedValueOnce(authError(code, message));
    expect(await signup(form('x@y'))).toEqual({
      success: false,
      error: message,
    });
  });
});
