'use client';
import React, { useEffect, useState } from 'react';
// import dynamic from "next/dynamic";
import { toast } from 'react-toastify';
// import "react-quill/dist/quill.snow.css";
import { useDispatch } from 'react-redux';
import { hideLoader, showLoader } from '@/lib/features/loader/loaderSlice';
import Navbar from '@/components/Navbar';
import { useAxiosGet, useAxiosPost } from '@/hooks/useAxios';
import { Button } from '@/components/ui/button';

// const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function EditArticle({ id }: { id: string }) {
  const [content, setContent] = useState<string>('');
  const dispatch = useDispatch();
  const [updateArticle] = useAxiosPost<{ success?: boolean }>(
    '/articles/{{articleId}}/update',
  );
  const [getArticle] = useAxiosGet<{
    success?: boolean;
    article: { id: string; content: string };
    message?: string;
  }>('/articles/{{articleId}}');

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

      if (response.data?.success) {
        toast.success('Article updated successfully!');
        window.location.href = `/articles/${id}`;
      } else {
        toast.error('Failed to update article.');
      }
    } catch (error) {
      toast.error('Failed to update article.');
      console.error(error);
    } finally {
      dispatch(hideLoader('updating article'));
    }
  };

  const fetchArticle = async () => {
    try {
      dispatch(showLoader('fetching article'));
      const response = await getArticle({}, { articleId: id });

      if (response?.data?.success) {
        setContent(response.data.article?.content);
      } else {
        toast.error(response?.data?.message ?? 'Failed to fetch article.');
      }
    } catch (error) {
      toast.error('Failed to fetch article.');
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
          {/* <ReactQuill
            value={content}
            onChange={setContent}
            preserveWhitespace
            modules={{
              toolbar: [
                [{ font: [] }, { size: [] }],
                ["bold", "italic", "underline", "strike"],
                [{ color: [] }, { background: [] }],
                [{ script: "sub" }, { script: "super" }],
                [{ header: "1" }, { header: "2" }, "blockquote", "code-block"],
                [{ list: "ordered" }, { list: "bullet" }],
                [{ indent: "-1" }, { indent: "+1" }],
                [{ direction: "rtl" }, { align: [] }],
                ["link", "image", "video"],
                ["clean"],
              ],
              // indent: {
              //   levels: [1, 2, 3, 4, 5],
              // },
            }}
          /> */}
        </div>
        <Button onClick={handleUpdateArticle}>Update Article</Button>
      </div>
    </>
  );
}
