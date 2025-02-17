'use client';
import React, { useEffect, useState } from 'react';
// import dynamic from "next/dynamic";
import { toast } from 'react-toastify';
// import "react-quill/dist/quill.snow.css";
import { useDispatch } from 'react-redux';
import { hideLoader, showLoader } from '@/lib/features/loader/loaderSlice';
import { fetchData } from '@/app/services/fetchData';
import Navbar from '@/components/Navbar';

// const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function EditArticle({ id }: { id: string }) {
  const [content, setContent] = useState<string>('');
  const dispatch = useDispatch();

  const updateArticle = async () => {
    try {
      dispatch(showLoader('updating article'));
      const response = await fetchData('post', `/articles/${id}/update`, {
        content,
      });

      if (response.data.success) {
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
      const response = await fetchData('GET', `/articles/${id}`);

      if (response?.data?.success) {
        setContent(response.data.article?.content);
      } else {
        toast.error(response?.data?.error ?? 'Failed to fetch article.');
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
        <div className="mb-6 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
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
        <button
          onClick={updateArticle}
          className="rounded-lg bg-blue-500 px-4 py-2 text-white"
        >
          Update Article
        </button>
      </div>
    </>
  );
}
