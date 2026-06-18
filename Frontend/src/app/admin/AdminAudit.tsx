'use client';

import { useEffect } from 'react';
import { useAxiosGet } from '@/hooks/useAxios';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { ScrollText } from 'lucide-react';

interface AuditLog {
  id: string;
  admin_id: string;
  action: string;
  entity: string;
  entity_id: string;
  ip_address?: string | null;
  created_at: string;
}

const actionTone = (action: string) => {
  if (/DELETE|REMOVE/i.test(action))
    return 'bg-rose-500/15 text-rose-600 dark:text-rose-400';
  if (/CREATE|ADD/i.test(action))
    return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400';
  if (/UPDATE|EDIT|ROLE/i.test(action))
    return 'bg-amber-500/15 text-amber-600 dark:text-amber-400';
  return 'bg-sky-500/15 text-sky-600 dark:text-sky-400';
};

export default function AdminAudit() {
  const [getLogs, state] = useAxiosGet<AuditLog[]>('/admin/audit/logs');

  useEffect(() => {
    void getLogs({ params: { limit: 100 } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logs = Array.isArray(state.data) ? state.data : [];

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border p-4">
        <h2 className="text-lg font-semibold">Audit Log</h2>
        <p className="text-sm text-muted-foreground">
          Every privileged admin action, newest first.
        </p>
      </div>

      {state.isLoading && !logs.length ? (
        <div className="space-y-3 p-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      ) : state.isError ? (
        <div className="p-6">
          <ErrorState
            title="Couldn't load audit logs"
            onRetry={() => void getLogs({ params: { limit: 100 } })}
          />
        </div>
      ) : logs.length === 0 ? (
        <div className="p-6">
          <EmptyState
            icon={ScrollText}
            title="No audit entries yet"
            description="Admin actions (role changes, deletions, moderation) will appear here."
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((l) => (
                <TableRow key={l.id}>
                  <TableCell>
                    <span
                      className={`rounded-md px-2 py-1 text-xs font-medium ${actionTone(l.action)}`}
                    >
                      {l.action}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{l.entity}</Badge>
                  </TableCell>
                  <TableCell className="max-w-[180px] truncate font-mono text-xs text-muted-foreground">
                    {l.entity_id}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {l.ip_address || '—'}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {l.created_at
                      ? new Date(l.created_at).toLocaleString()
                      : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
