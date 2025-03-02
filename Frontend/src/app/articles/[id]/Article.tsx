'use client';
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { toast } from 'react-toastify';
import DOMPurify from 'dompurify';
import { useAxiosGet, useAxiosPost } from '@/hooks/useAxios';

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

export default function Article({ id }: { id: string }) {
  const [article, setArticle] = useState<IArticle>();
  const [moderationNotes, setModerationNotes] = useState('');
  const [newNote, setNewNote] = useState('');
  const [updateArticle] = useAxiosPost<{ success?: boolean }>(
    '/articles/{{articleId}}/moderation',
  );

  const [getArticle] = useAxiosGet<{
    success?: boolean;
    article: IArticle;
    message?: string;
  }>('/articles/{{articleId}}');

  const handleSaveNote = async () => {
    try {
      const response = await updateArticle({
        moderationNotes: newNote,
      });

      if (response.data?.success) {
        toast.success('Moderation note saved successfully!');
        setNewNote('');
        window.location.href = '/article-listing';
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

      if (response?.data?.success) {
        setArticle(response?.data?.article);
        setModerationNotes(response?.data?.article?.moderationNotes);
      } else {
        toast.error(response?.data?.message ?? 'Failed to fetch article.');
      }
    } catch (error) {
      console.error('Error fetching article:', error);
      toast.error('Error fetching article.');
    }
  };

  useEffect(() => {
    fetchResource();
  }, [id]);
  return (
    <>
      <Navbar />
      <div className="container mx-auto p-6">
        <h1 className="mb-6 text-3xl font-bold">{article?.title}</h1>
        <div className="mb-4">
          <p className="text-gray-700 dark:text-white">
            By {article?.author?.username}
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            {new Date(article?.createdAt ?? '').toLocaleDateString()}
          </p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
          <p
            className="prose dark:prose-invert"
            dangerouslySetInnerHTML={{
              __html: sanitizeContent(article?.content ?? ''),
            }}
          ></p>
        </div>
        <div className="mt-6 rounded-lg bg-gray-100 p-4 dark:bg-gray-700">
          <h2 className="mb-4 text-xl font-semibold">Moderation Notes</h2>
          {moderationNotes ? (
            <p className="mb-4">{moderationNotes}</p>
          ) : (
            <p className="mb-4 text-gray-500">No moderation notes yet.</p>
          )}
          <textarea
            className="w-full rounded-lg border p-2 dark:bg-gray-600 dark:text-white"
            rows={4}
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add moderation notes here..."
          />
          <button
            onClick={handleSaveNote}
            className="mt-4 rounded-lg bg-blue-500 px-4 py-2 text-white"
          >
            Save Note
          </button>
        </div>
      </div>
    </>
  );
}
