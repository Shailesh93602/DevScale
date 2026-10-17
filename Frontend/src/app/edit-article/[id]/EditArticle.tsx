'use client';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { hideLoader, showLoader } from '@/lib/features/loader/loaderSlice';
import Navbar from '@/components/Navbar';
import { useAxiosGet, useAxiosPost } from '@/hooks/useAxios';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function EditArticle({ id }: { id: string }) {
  const [content, setContent] = useState<string>('');
  const dispatch = useDispatch();
  const [updateArticle] = useAxiosPost<unknown>(
    '/articles/{{articleId}}/update',
  );
  const [getArticle] = useAxiosGet<{ id: string; content: string }>(
    '/articles/{{articleId}}',
  );

  const handleUpdateArticle = async () => {
    try {
      dispatch(showLoader('updating article'));
      const response = await updateArticle(
        {
          content,
        },
        {},
        { articleId: id },
      );

      if (response.success) {
        toast.success('Article updated successfully!');
        window.location.href = `/articles/${id}`;
      } else {
        toast.error('Unable to save your changes. Please try again.');
      }
    } catch (error) {
      toast.error('Unable to save your changes. Please try again.');
      console.error(error);
    } finally {
      dispatch(hideLoader('updating article'));
    }
  };

  const fetchArticle = async () => {
    try {
      dispatch(showLoader('fetching article'));
      const response = await getArticle({}, { articleId: id });

      if (response.success) {
        setContent(response.data?.content ?? '');
      } else {
        toast.error(
          response.message ||
            'Unable to load this article. Please refresh the page.',
        );
      }
    } catch (error) {
      toast.error('Unable to load this article. Please refresh the page.');
      console.error(error);
    } finally {
      dispatch(hideLoader('fetching article'));
    }
  };

  useEffect(() => {
    fetchArticle();
  }, [id]);

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-6">
        <div className="mb-6 rounded-lg bg-card p-6 shadow-md">
          <Textarea
            aria-label="Article content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={20}
            className="font-mono"
          />
        </div>
        <Button onClick={handleUpdateArticle}>Update Article</Button>
      </div>
    </>
  );
}
