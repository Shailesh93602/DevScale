'use client';

import { useEffect, useState } from 'react';
import { useAxiosGet, useAxiosPost } from '@/hooks/useAxios';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, Check, X } from 'lucide-react';

interface ContentItem {
  id: string;
  title?: string | null;
  type?: string | null;
  status?: string | null;
  created_at?: string;
  author?: { id: string; username?: string | null } | null;
}

export default function AdminModeration() {
  const [getQueue, state] = useAxiosGet<ContentItem[]>(
    '/admin/moderation/queue',
  );
  const [moderate] = useAxiosPost<unknown, { action: string; reason: string }>(
    '/admin/moderation/{{contentId}}',
  );
  const { toast } = useToast();
  const [rejecting, setRejecting] = useState<ContentItem | null>(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    void getQueue();
  }, []);

  const items = Array.isArray(state.data) ? state.data : [];

  const act = async (
    item: ContentItem,
    action: 'approve' | 'reject',
    why = '',
  ) => {
    setBusy(item.id);
    const res = await moderate({ action, reason: why }, undefined, {
      contentId: item.id,
    });
    setBusy(null);
    if (res?.success) {
      toast({
        title: action === 'approve' ? 'Approved' : 'Rejected',
        description: item.title || 'Content updated.',
      });
      setRejecting(null);
      setReason('');
      void getQueue();
    } else {
      toast({
        title: 'Action failed',
        description: res?.message ?? 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border p-4">
        <h2 className="text-lg font-semibold">Content Moderation</h2>
        <p className="text-sm text-muted-foreground">
          Review submitted content awaiting approval.
        </p>
      </div>

      {state.isLoading && !items.length ? (
        <div className="space-y-3 p-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : state.isError ? (
        <div className="p-6">
          <ErrorState
            title="Couldn't load the moderation queue"
            onRetry={() => void getQueue()}
          />
        </div>
      ) : items.length === 0 ? (
        <div className="p-6">
          <EmptyState
            icon={ShieldCheck}
            title="Queue is clear"
            description="No content is awaiting review right now."
          />
        </div>
      ) : (
        <div className="divide-y divide-border">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {item.type ? (
                    <Badge variant="outline" className="capitalize">
                      {item.type.toLowerCase()}
                    </Badge>
                  ) : null}
                  <span className="truncate font-medium">
                    {item.title || 'Untitled content'}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.author?.username ? `by ${item.author.username}` : ''}
                  {item.created_at
                    ? ` · ${new Date(item.created_at).toLocaleDateString()}`
                    : ''}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-600"
                  disabled={busy === item.id}
                  onClick={() => act(item, 'approve')}
                >
                  <Check className="h-4 w-4" /> Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  disabled={busy === item.id}
                  onClick={() => {
                    setReason('');
                    setRejecting(item);
                  }}
                >
                  <X className="h-4 w-4" /> Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!rejecting} onOpenChange={(o) => !o && setRejecting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject content</DialogTitle>
            <DialogDescription>
              Optionally tell the author why{' '}
              <span className="font-medium text-foreground">
                {rejecting?.title || 'this content'}
              </span>{' '}
              was rejected.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason (optional)…"
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejecting(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={busy === rejecting?.id}
              onClick={() => rejecting && act(rejecting, 'reject', reason)}
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
