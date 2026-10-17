'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAxiosGet, useAxiosPatch, useAxiosDelete } from '@/hooks/useAxios';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Trash2, Users as UsersIcon } from 'lucide-react';

interface Role {
  id: string;
  name: string;
}
interface AdminUser {
  id: string;
  username: string;
  first_name?: string | null;
  last_name?: string | null;
  email: string;
  avatar_url?: string | null;
  status?: string | null;
  created_at?: string;
  role?: { id: string; name: string } | null;
}

/** Shape of `userRepository.searchUsers`: the total lives under `pagination`. */
export interface AdminUsersPage {
  users: AdminUser[];
  pagination?: { total: number; pages: number; page: number; limit: number };
}

const PAGE_SIZE = 50;

const roleBadge = (name?: string) => {
  const n = (name || 'STUDENT').toUpperCase();
  // Theme tokens, not palette shades with a dark-mode variant — see the contract in
  // tests/regression-ui-contract.spec.ts and the contrast note in AdminOverview.
  if (n === 'ADMIN') return 'bg-red/15 text-red';
  if (n === 'MODERATOR') return 'bg-warning/15 text-warning';
  return 'bg-blue/15 text-blue';
};

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [pendingRole, setPendingRole] = useState<{
    user: AdminUser;
    roleId: string;
  } | null>(null);
  const [roleSaving, setRoleSaving] = useState(false);
  // Results live here, not in the hook's state, so a slow earlier search
  // cannot overwrite a newer one: only the latest request id may write.
  const [result, setResult] = useState<AdminUsersPage | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const latestRequest = useRef(0);

  const [getUsers, usersState] = useAxiosGet<AdminUsersPage>('/admin/users');
  const [getRoles, rolesState] = useAxiosGet<Role[]>('/admin/roles');
  const [patchRole] = useAxiosPatch<unknown, { roleId: string }>(
    '/admin/users/{{userId}}/role',
  );
  const [deleteUser] = useAxiosDelete('/admin/users/{{userId}}');
  const { toast } = useToast();

  const load = useCallback(
    async (q?: string, p = 1) => {
      const requestId = ++latestRequest.current;
      const res = await getUsers({
        params: { limit: PAGE_SIZE, page: p, ...(q ? { search: q } : {}) },
      });
      if (requestId !== latestRequest.current) return;
      if (res.success) {
        setResult(res.data);
        setLoadFailed(false);
      } else {
        setLoadFailed(true);
      }
    },
    [getUsers],
  );

  useEffect(() => {
    void load();
    void getRoles();
  }, []);

  // Debounced search
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onSearch = (v: string) => {
    setSearch(v);
    setPage(1);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void load(v.trim() || undefined, 1), 400);
  };

  const reload = () => void load(search.trim() || undefined, page);
  const goToPage = (p: number) => {
    setPage(p);
    void load(search.trim() || undefined, p);
  };

  const roles = rolesState.data ?? [];
  const users = result?.users ?? [];
  const total = result?.pagination?.total ?? users.length;
  const totalPages = Math.max(1, result?.pagination?.pages ?? 1);
  const isSelf = (u: AdminUser) => !!currentUser && u.id === currentUser.id;

  const changeRole = async (user: AdminUser, roleId: string) => {
    if (roleSaving) return;
    setRoleSaving(true);
    const res = await patchRole({ roleId }, undefined, { userId: user.id });
    setRoleSaving(false);
    setPendingRole(null);
    if (res?.success) {
      toast({
        title: 'Role updated',
        description: `${user.username} updated.`,
      });
      reload();
    } else {
      toast({
        title: 'Failed to update role',
        description: res?.message ?? 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const confirmDelete = async () => {
    if (!toDelete || deleting) return;
    setDeleting(true);
    const res = await deleteUser(undefined, { userId: toDelete.id });
    setDeleting(false);
    if (res?.success) {
      toast({
        title: 'User deleted',
        description: `${toDelete.username} removed.`,
      });
      setToDelete(null);
      reload();
    } else {
      toast({
        title: 'Failed to delete',
        description: res?.message ?? 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">User Management</h2>
          <p className="text-sm text-muted-foreground">{total} users</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search by name, email, username…"
            className="pl-9"
          />
        </div>
      </div>

      {usersState.isLoading && !users.length ? (
        <div className="space-y-3 p-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : loadFailed ? (
        <div className="p-6">
          <ErrorState title="Couldn't load users" onRetry={reload} />
        </div>
      ) : users.length === 0 ? (
        <div className="p-6">
          <EmptyState
            icon={UsersIcon}
            title="No users found"
            description={
              search ? 'Try a different search.' : 'No registered users yet.'
            }
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => {
                const name =
                  [u.first_name, u.last_name].filter(Boolean).join(' ') ||
                  u.username;
                return (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                          {(name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-medium">{name}</div>
                          <div className="truncate text-xs text-muted-foreground">
                            {u.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {roles.length ? (
                        <Select
                          value={u.role?.id}
                          disabled={isSelf(u)}
                          onValueChange={(v) =>
                            setPendingRole({ user: u, roleId: v })
                          }
                        >
                          <SelectTrigger
                            className="h-8 w-[140px]"
                            aria-label={`Role for ${name}`}
                            title={
                              isSelf(u)
                                ? 'You cannot change your own role'
                                : undefined
                            }
                          >
                            <SelectValue
                              placeholder={u.role?.name ?? 'Set role'}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map((r) => (
                              <SelectItem key={r.id} value={r.id}>
                                {r.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span
                          className={`rounded-md px-2 py-1 text-xs font-medium ${roleBadge(u.role?.name)}`}
                        >
                          {u.role?.name ?? 'STUDENT'}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          (u.status ?? 'active') === 'active'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {u.status ?? 'active'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {u.created_at
                        ? new Date(u.created_at).toLocaleDateString()
                        : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setToDelete(u)}
                        disabled={isSelf(u)}
                        title={
                          isSelf(u)
                            ? 'You cannot delete your own account'
                            : undefined
                        }
                        aria-label={`Delete ${name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border p-4 text-sm">
              <span className="text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => goToPage(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => goToPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <Dialog
        open={!!pendingRole}
        onOpenChange={(o) => !o && !roleSaving && setPendingRole(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change role?</DialogTitle>
            <DialogDescription>
              Set{' '}
              <span className="font-medium text-foreground">
                {pendingRole?.user.username}
              </span>{' '}
              to{' '}
              <span className="font-medium text-foreground">
                {roles.find((r) => r.id === pendingRole?.roleId)?.name ??
                  'the selected role'}
              </span>
              ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={roleSaving}
              onClick={() => setPendingRole(null)}
            >
              Cancel
            </Button>
            <Button
              disabled={roleSaving}
              onClick={() =>
                pendingRole && changeRole(pendingRole.user, pendingRole.roleId)
              }
            >
              {roleSaving ? 'Saving…' : 'Change role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete user?</DialogTitle>
            <DialogDescription>
              This permanently removes{' '}
              <span className="font-medium text-foreground">
                {toDelete?.username}
              </span>{' '}
              ({toDelete?.email}). This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting…' : 'Delete user'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
