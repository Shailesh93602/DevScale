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

const roleBadge = (name?: string) => {
  const n = (name || 'STUDENT').toUpperCase();
  if (n === 'ADMIN') return 'bg-rose-500/15 text-rose-600 dark:text-rose-400';
  if (n === 'MODERATOR')
    return 'bg-amber-500/15 text-amber-600 dark:text-amber-400';
  return 'bg-sky-500/15 text-sky-600 dark:text-sky-400';
};

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const [toDelete, setToDelete] = useState<AdminUser | null>(null);

  const [getUsers, usersState] = useAxiosGet<{
    users: AdminUser[];
    total: number;
  }>('/admin/users');
  const [getRoles, rolesState] = useAxiosGet<Role[]>('/admin/roles');
  const [patchRole] = useAxiosPatch<unknown, { roleId: string }>(
    '/admin/users/{{userId}}/role'
  );
  const [deleteUser] = useAxiosDelete('/admin/users/{{userId}}');
  const { toast } = useToast();

  const load = useCallback(
    (q?: string) => {
      void getUsers({ params: { limit: 50, ...(q ? { search: q } : {}) } });
    },
    [getUsers]
  );

  useEffect(() => {
    load();
    void getRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced search
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onSearch = (v: string) => {
    setSearch(v);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => load(v.trim() || undefined), 400);
  };

  const roles = rolesState.data ?? [];
  const users = usersState.data?.users ?? [];

  const changeRole = async (user: AdminUser, roleId: string) => {
    const res = await patchRole({ roleId }, undefined, { userId: user.id });
    if (res?.success) {
      toast({ title: 'Role updated', description: `${user.username} updated.` });
      load(search.trim() || undefined);
    } else {
      toast({
        title: 'Failed to update role',
        description: res?.message ?? 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    const res = await deleteUser(undefined, { userId: toDelete.id });
    if (res?.success) {
      toast({ title: 'User deleted', description: `${toDelete.username} removed.` });
      setToDelete(null);
      load(search.trim() || undefined);
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
          <p className="text-sm text-muted-foreground">
            {usersState.data?.total ?? users.length} users
          </p>
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
      ) : usersState.isError ? (
        <div className="p-6">
          <ErrorState
            title="Couldn't load users"
            onRetry={() => load(search.trim() || undefined)}
          />
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
                          onValueChange={(v) => changeRole(u, v)}
                        >
                          <SelectTrigger className="h-8 w-[140px]">
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
        </div>
      )}

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
            <Button variant="destructive" onClick={confirmDelete}>
              Delete user
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
