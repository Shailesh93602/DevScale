'use client';
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { toast } from 'react-toastify';
import DOMPurify from 'dompurify';
import { useAxiosGet, useAxiosPost } from '@/hooks/useAxios';
import { Button } from '@/components/ui/button';

interface IArticle {
  id: string;
  title: string;
  author: { username: string };
  content: string;
  createdAt: string;
  moderationNotes: string;
}
const sanitizeContent = (content: string) => {
  return DOMPurify.sanitize(content);
};

export default function Article({
  id,
  initialData,
}: {
  id: string;
  initialData?: IArticle;
}) {
  const [article, setArticle] = useState<IArticle | undefined>(initialData);
  const [moderationNotes, setModerationNotes] = useState(
    initialData?.moderationNotes || '',
  );
  const [newNote, setNewNote] = useState('');
  const [updateArticle] = useAxiosPost<{ success?: boolean }>(
    '/articles/{{articleId}}/moderation',
  );

  const [getArticle] = useAxiosGet<IArticle>('/articles/{{articleId}}');

  const handleSaveNote = async () => {
    try {
      const response = await updateArticle({
        moderationNotes: newNote,
      });

      if (response.data?.success) {
        toast.success('Moderation note saved successfully!');
        setNewNote('');
        globalThis.location.href = '/article-listing';
      } else {
        toast.error('Failed to save moderation note.');
      }
    } catch (error) {
      console.error('Error saving moderation note:', error);
      toast.error('Error saving moderation note.');
    }
  };

  const fetchResource = async () => {
    try {
      const response = await getArticle({}, { articleId: id });

      if (response?.success) {
        setArticle(response?.data as IArticle);
        setModerationNotes((response?.data as IArticle)?.moderationNotes);
      } else {
        toast.error(response?.message ?? 'Failed to fetch article.');
      }
    } catch (error) {
      console.error('Error fetching article:', error);
      toast.error('Error fetching article.');
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
            {new Date(article?.createdAt ?? '').toLocaleDateString()}
          </p>
        </div>
        <div className="rounded-lg bg-card p-6 shadow-md">
          <p
            className="prose"
            dangerouslySetInnerHTML={{
              __html: sanitizeContent(article?.content ?? ''),
            }}
          ></p>
        </div>
        <div className="mt-6 rounded-lg bg-muted p-4">
          <h2 className="mb-4 text-xl font-semibold">Moderation Notes</h2>
          {moderationNotes ? (
            <p className="mb-4">{moderationNotes}</p>
          ) : (
            <p className="mb-4 text-muted-foreground">
              No moderation notes yet.
            </p>
          )}
          <textarea
            className="w-full rounded-lg border bg-input p-2 text-foreground"
            rows={4}
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add moderation notes here..."
          />
          <Button onClick={handleSaveNote} className="mt-4">
            Save Note
          </Button>
        </div>
      </div>
    </>
  );
}
