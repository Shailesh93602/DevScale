'use client';

import { useEffect, useState } from 'react';
import { RoleGuard } from '@/components/guards/RouteGuards';
import { useAuth } from '@/contexts/AuthContext';
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
import Link from 'next/link';

interface Article {
  id: string;
  title?: string | null;
  status?: string | null;
  created_at?: string;
  author?: { username?: string | null } | null;
}

export default function ModeratePage() {
  const { user } = useAuth();
  const name = user?.first_name || 'Moderator';

  const [getQueue, state] = useAxiosGet<Article[]>(
    '/articles/moderation/queue'
  );
  const [setStatus] = useAxiosPost<unknown, { articleId: string; status: string }>(
    '/articles/status'
  );
  const [addNote] = useAxiosPost<unknown, { action: string; notes: string }>(
    '/articles/{{id}}/moderation'
  );
  const { toast } = useToast();

  const [rejecting, setRejecting] = useState<Article | null>(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    void getQueue();
  }, []);

  const items = Array.isArray(state.data) ? state.data : [];

  const approve = async (a: Article) => {
    setBusy(a.id);
    const res = await setStatus({ articleId: a.id, status: 'APPROVED' });
    setBusy(null);
    if (res?.success) {
      toast({ title: 'Approved', description: a.title || 'Article published.' });
      void getQueue();
    } else {
      toast({
        title: 'Action failed',
        description: res?.message ?? 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const reject = async (a: Article, why: string) => {
    setBusy(a.id);
    // Record the reason (if any) first, then set the final REJECTED status.
    if (why.trim()) {
      await addNote({ action: 'REJECT', notes: why.trim() }, undefined, {
        id: a.id,
      });
    }
    const res = await setStatus({ articleId: a.id, status: 'REJECTED' });
    setBusy(null);
    if (res?.success) {
      toast({ title: 'Rejected', description: a.title || 'Article rejected.' });
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
    <RoleGuard roles={['ADMIN', 'MODERATOR']}>
      <div className="container mx-auto px-4 py-8 md:py-10">
        {/* Header */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <ShieldCheck className="h-3.5 w-3.5" />
              Moderation
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Hi {name}, here&apos;s the review queue
            </h1>
            <p className="mt-1 text-muted-foreground">
              Approve or reject community content awaiting review.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
        </div>

        <div className="rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border p-4">
            <div>
              <h2 className="text-lg font-semibold">Review queue</h2>
              <p className="text-sm text-muted-foreground">
                Articles pending review.
              </p>
            </div>
            {items.length > 0 ? (
              <Badge variant="secondary">{items.length} pending</Badge>
            ) : null}
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
                title="Couldn't load the review queue"
                onRetry={() => void getQueue()}
              />
            </div>
          ) : items.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={ShieldCheck}
                title="All caught up"
                description="No articles are awaiting review right now."
              />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {items.map((a) => (
                <div
                  key={a.id}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Article</Badge>
                      <span className="truncate font-medium">
                        {a.title || 'Untitled article'}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {a.author?.username ? `by ${a.author.username}` : ''}
                      {a.created_at
                        ? ` · ${new Date(a.created_at).toLocaleDateString()}`
                        : ''}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-600"
                      disabled={busy === a.id}
                      onClick={() => approve(a)}
                    >
                      <Check className="h-4 w-4" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      disabled={busy === a.id}
                      onClick={() => {
                        setReason('');
                        setRejecting(a);
                      }}
                    >
                      <X className="h-4 w-4" /> Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={!!rejecting} onOpenChange={(o) => !o && setRejecting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject article</DialogTitle>
            <DialogDescription>
              Optionally tell the author why{' '}
              <span className="font-medium text-foreground">
                {rejecting?.title || 'this article'}
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
              onClick={() => rejecting && reject(rejecting, reason)}
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </RoleGuard>
  );
}
