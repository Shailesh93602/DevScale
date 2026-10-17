'use client';
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { toast } from 'react-toastify';
import { useSanitizedHtml } from '@/lib/sanitize-html';
import { useAuth } from '@/contexts/AuthContext';
import { useAxiosGet, useAxiosPost } from '@/hooks/useAxios';
import { Button } from '@/components/ui/button';

type ModerationAction = 'APPROVE' | 'REJECT' | 'FLAG';

interface IModeration {
  id: string;
  action: string;
  notes: string | null;
  created_at: string;
  moderator?: { username: string };
}

interface IArticle {
  id: string;
  title: string;
  author: { username: string };
  content: string;
  created_at: string;
  /** Present only for the author and moderators; the API strips it for everyone else. */
  moderations?: IModeration[];
}

export default function Article({
  id,
  initialData,
}: {
  id: string;
  initialData?: IArticle;
}) {
  const { hasAnyRole } = useAuth();
  const canModerate = hasAnyRole(['ADMIN', 'MODERATOR']);
  const [article, setArticle] = useState<IArticle | undefined>(initialData);
  const [newNote, setNewNote] = useState('');
  const [action, setAction] = useState<ModerationAction>('FLAG');
  const [saving, setSaving] = useState(false);
  const articleHtml = useSanitizedHtml(article?.content ?? '');
  const [updateArticle] = useAxiosPost<unknown>(
    '/articles/{{articleId}}/moderation',
  );

  const [getArticle] = useAxiosGet<IArticle>('/articles/{{articleId}}');

  const handleSaveNote = async () => {
    if (saving) return;
    setSaving(true);
    const response = await updateArticle(
      { notes: newNote, action },
      undefined,
      { articleId: id },
    );
    setSaving(false);
    if (response.success) {
      toast.success('Moderation note saved successfully!');
      setNewNote('');
      await fetchResource();
    } else {
      toast.error(
        response.message || 'Unable to save your note. Please try again.',
      );
    }
  };

  const fetchResource = async () => {
    try {
      const response = await getArticle({}, { articleId: id });

      if (response?.success) {
        setArticle(response?.data as IArticle);
      } else {
        toast.error(
          response?.message ??
            'Unable to load this article. Please refresh the page.',
        );
      }
    } catch (error) {
      console.error('Error fetching article:', error);
      toast.error('Unable to load this article. Please refresh the page.');
    }
  };

  useEffect(() => {
    if (!initialData) {
      const load = async () => {
        await fetchResource();
      };
      load();
    }
  }, [id, initialData]);
  return (
    <>
      <Navbar />
      <div className="container mx-auto p-6">
        <h1 className="mb-6 text-3xl font-bold">{article?.title}</h1>
        <div className="mb-4">
          <p className="text-foreground">By {article?.author?.username}</p>
          <p className="text-muted-foreground">
            {article?.created_at
              ? new Date(article.created_at).toLocaleDateString()
              : ''}
          </p>
        </div>
        <div className="rounded-lg bg-card p-6 shadow-md">
          <p
            className="prose"
            dangerouslySetInnerHTML={{
              __html: articleHtml,
            }}
          ></p>
        </div>
        {canModerate && (
          <div className="mt-6 rounded-lg bg-muted p-4">
            <h2 className="mb-4 text-xl font-semibold">Moderation Notes</h2>
            {article?.moderations?.some((m) => m.notes) ? (
              <ul className="mb-4 space-y-2">
                {article.moderations
                  .filter((m) => m.notes)
                  .map((m) => (
                    <li key={m.id}>
                      <span className="font-semibold">{m.action}</span>
                      {m.moderator?.username
                        ? ` by ${m.moderator.username}`
                        : ''}
                      : {m.notes}
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="mb-4 text-muted-foreground">
                No moderation notes yet.
              </p>
            )}
            <label
              className="mb-2 block text-sm font-medium"
              htmlFor="mod-action"
            >
              Action
            </label>
            <select
              id="mod-action"
              className="mb-3 rounded-lg border bg-input p-2 text-foreground"
              value={action}
              onChange={(e) => setAction(e.target.value as ModerationAction)}
            >
              <option value="APPROVE">Approve</option>
              <option value="REJECT">Reject</option>
              <option value="FLAG">Flag</option>
            </select>
            <textarea
              aria-label="Moderation note"
              className="w-full rounded-lg border bg-input p-2 text-foreground"
              rows={4}
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add moderation notes here..."
            />
            <Button
              onClick={handleSaveNote}
              className="mt-4"
              disabled={saving || !newNote.trim()}
            >
              Save Note
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
