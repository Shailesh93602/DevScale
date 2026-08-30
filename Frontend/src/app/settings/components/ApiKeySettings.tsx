'use client';

import { useCallback, useEffect, useState } from 'react';
import { KeyRound, ShieldCheck, Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useAxiosGet, useAxiosPut, useAxiosDelete } from '@/hooks/useAxios';

interface AiKeyStatus {
  provider: string;
  configured: boolean;
  hint: string | null;
  updatedAt: string | null;
  lastUsedAt: string | null;
  storageAvailable: boolean;
}

/**
 * Manage your own Gemini API key.
 *
 * TWO RULES THIS COMPONENT FOLLOWS.
 *
 * 1. The key is never rendered back. Not after saving, not on reload. The
 *    server has no endpoint that returns it, and this component holds it in
 *    state only for the moment between typing and submitting — cleared
 *    immediately on success, so it does not sit in a React tree that a crash
 *    reporter or a screenshot could capture.
 *
 * 2. Nothing here claims more security than exists. The copy says "encrypted
 *    before it is stored" because that is exactly what happens
 *    (AES-256-GCM, Backend/src/utils/secretBox.ts). It does not say "we can
 *    never see it" — the server decrypts it to make the call, and saying
 *    otherwise would be the kind of false claim that costs trust when someone
 *    reads the code.
 */
export function ApiKeySettings() {
  const [status, setStatus] = useState<AiKeyStatus | null>(null);
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);

  const [fetchStatus] = useAxiosGet<AiKeyStatus>('/settings/ai-key');
  const [saveKey] = useAxiosPut<AiKeyStatus, { apiKey: string }>(
    '/settings/ai-key',
  );
  const [removeKey] = useAxiosDelete<AiKeyStatus>('/settings/ai-key');

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetchStatus();
    if (res.success && res.data) {
      setStatus(res.data);
      setLoadFailed(false);
    } else {
      setLoadFailed(true);
    }
    setLoading(false);
  }, [fetchStatus]);

  useEffect(() => {
    void load();
  }, [load]);

  const onSave = async () => {
    const apiKey = value.trim();
    if (!apiKey) {
      toast.error('Paste your API key first.');
      return;
    }

    setSaving(true);
    const res = await saveKey({ apiKey });
    setSaving(false);

    if (res.success) {
      // Cleared before anything else, so a re-render never has the key in it.
      setValue('');
      toast.success('Your API key is saved.');
      void load();
    } else {
      toast.error(
        res.message || 'Could not save your API key. Please try again.',
      );
    }
  };

  const onRemove = async () => {
    setSaving(true);
    const res = await removeKey();
    setSaving(false);

    if (res.success) {
      setValue('');
      toast.success('Your API key has been removed.');
      void load();
    } else {
      toast.error(
        res.message || 'Could not remove your API key. Please try again.',
      );
    }
  };

  return (
    <Card>
      <CardContent className="space-y-5 p-6">
        <div className="flex items-start gap-3">
          <KeyRound className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
          <div>
            <h2 className="text-lg font-semibold">Your Gemini API key</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              The AI features — code review, the tutor, hints and
              recommendations — run on your own Google Gemini key, so your usage
              is billed to your own free-tier quota rather than shared with
              everyone else on the platform.
            </p>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : loadFailed ? (
          // Distinguished from "no key set". Telling someone they have no key
          // when we simply could not check is how people end up re-entering a
          // key that was already there.
          <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm">
            <p>Unable to load your API key settings.</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => void load()}
            >
              Try again
            </Button>
          </div>
        ) : (
          <>
            {status?.storageAvailable === false && (
              <div className="rounded-md border border-amber-500/40 bg-amber-500/5 p-3 text-sm">
                Saving API keys is unavailable on this deployment right now.
                Nothing you enter here would be stored.
              </div>
            )}

            {status?.configured && (
              <div className="flex flex-wrap items-center gap-2 rounded-md border bg-muted/40 p-3 text-sm">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>
                  A key ending in{' '}
                  <span className="font-mono">{status.hint}</span> is saved and
                  encrypted.
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto text-destructive"
                  disabled={saving}
                  onClick={() => void onRemove()}
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  Remove
                </Button>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="gemini-api-key">
                {status?.configured ? 'Replace your key' : 'Add your key'}
              </Label>
              <Input
                id="gemini-api-key"
                type="password"
                autoComplete="off"
                spellCheck={false}
                placeholder="Paste your Gemini API key"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                disabled={saving || status?.storageAvailable === false}
              />
              <p className="text-xs text-muted-foreground">
                Encrypted with AES-256-GCM before it is stored, and only ever
                used to make your own requests. It is never shown again after
                you save it — only the last four characters. You can remove it
                at any time.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={() => void onSave()}
                disabled={
                  saving || !value.trim() || status?.storageAvailable === false
                }
              >
                {saving ? 'Saving…' : 'Save key'}
              </Button>
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                Get a free key from Google AI Studio
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
