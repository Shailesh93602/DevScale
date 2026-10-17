import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';

// useAxios* never throws; each mock returns the real envelope shape.
const getUsers = vi.fn();
const getRoles = vi.fn();
const patchRole = vi.fn();
const deleteUser = vi.fn();
vi.mock('@/hooks/useAxios', () => ({
  useAxiosGet: (url: string) =>
    url === '/admin/roles'
      ? [
          getRoles,
          {
            data: [
              { id: 'r-admin', name: 'ADMIN' },
              { id: 'r-student', name: 'STUDENT' },
            ],
          },
        ]
      : [getUsers, { isLoading: false }],
  useAxiosPatch: () => [patchRole, {}],
  useAxiosDelete: () => [deleteUser, {}],
}));
vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'me' } }),
}));
// Radix Select does not open in jsdom; a native select exercises the same props.
vi.mock('@/components/ui/select', () => ({
  Select: ({
    value,
    disabled,
    onValueChange,
    children,
  }: {
    value?: string;
    disabled?: boolean;
    onValueChange: (v: string) => void;
    children: ReactNode;
  }) => (
    <select
      data-testid="role-select"
      value={value}
      disabled={disabled}
      onChange={(e) => onValueChange(e.target.value)}
    >
      {children}
    </select>
  ),
  SelectTrigger: () => null,
  SelectValue: () => null,
  SelectContent: ({ children }: { children: ReactNode }) => <>{children}</>,
  SelectItem: ({ value, children }: { value: string; children: ReactNode }) => (
    <option value={value}>{children}</option>
  ),
}));

import AdminUsers from './AdminUsers';

const user = (id: string, username: string) => ({
  id,
  username,
  email: `${username}@x.test`,
  role: { id: 'r-student', name: 'STUDENT' },
});
const ok = (users: unknown[], total: number, pages: number) => ({
  success: true,
  error: false,
  message: 'USERS_FETCHED',
  data: { users, pagination: { total, pages, page: 1, limit: 50 } },
});

describe('AdminUsers', () => {
  beforeEach(() => {
    vi.useRealTimers();
    getUsers.mockReset();
    getRoles.mockReset().mockResolvedValue({ success: true, data: [] });
    patchRole.mockReset();
    deleteUser.mockReset();
  });

  it('shows the real total from pagination and pages past the first 50', async () => {
    getUsers.mockResolvedValue(ok([user('u1', 'alice')], 120, 3));
    render(<AdminUsers />);
    expect(await screen.findByText('120 users')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(getUsers).toHaveBeenLastCalledWith({
      params: { limit: 50, page: 2 },
    });
  });

  it('a slow earlier search cannot overwrite a newer one', async () => {
    vi.useFakeTimers();
    let resolveSlow: (v: unknown) => void = () => {};
    getUsers
      .mockResolvedValueOnce(ok([], 0, 1))
      .mockReturnValueOnce(new Promise((r) => (resolveSlow = r)))
      .mockResolvedValueOnce(ok([user('u2', 'bob')], 1, 1));
    render(<AdminUsers />);
    const input = screen.getByPlaceholderText(/Search by name/);
    await act(async () => {
      fireEvent.change(input, { target: { value: 'a' } });
      vi.advanceTimersByTime(400);
    });
    await act(async () => {
      fireEvent.change(input, { target: { value: 'bo' } });
      vi.advanceTimersByTime(400);
    });
    await act(async () => {
      resolveSlow(ok([user('u3', 'stale')], 1, 1));
    });
    expect(screen.getByText('bob')).toBeInTheDocument();
    expect(screen.queryByText('stale')).not.toBeInTheDocument();
  });

  it('disables role and delete controls on the signed-in admin', async () => {
    getUsers.mockResolvedValue(
      ok([user('me', 'self'), user('u1', 'alice')], 2, 1),
    );
    render(<AdminUsers />);
    expect(
      await screen.findByRole('button', { name: 'Delete self' }),
    ).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Delete alice' })).toBeEnabled();
    const selects = screen.getAllByTestId('role-select');
    expect(selects[0]).toBeDisabled();
    expect(selects[1]).toBeEnabled();
  });

  it('a role change waits for confirmation', async () => {
    getUsers.mockResolvedValue(ok([user('u1', 'alice')], 1, 1));
    patchRole.mockResolvedValue({ success: true, data: null });
    render(<AdminUsers />);
    const select = await screen.findByTestId('role-select');
    fireEvent.change(select, { target: { value: 'r-admin' } });
    expect(patchRole).not.toHaveBeenCalled();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Change role' }));
    });
    expect(patchRole).toHaveBeenCalledWith({ roleId: 'r-admin' }, undefined, {
      userId: 'u1',
    });
  });

  it('a double click on Delete user sends one DELETE', async () => {
    getUsers.mockResolvedValue(ok([user('u1', 'alice')], 1, 1));
    let resolveDelete: (v: unknown) => void = () => {};
    deleteUser.mockReturnValue(new Promise((r) => (resolveDelete = r)));
    render(<AdminUsers />);
    fireEvent.click(
      await screen.findByRole('button', { name: 'Delete alice' }),
    );
    const confirm = screen.getByRole('button', { name: 'Delete user' });
    fireEvent.click(confirm);
    fireEvent.click(confirm);
    await act(async () => resolveDelete({ success: true, data: null }));
    expect(deleteUser).toHaveBeenCalledTimes(1);
  });
});
