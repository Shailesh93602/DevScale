'use client';
import { fetchData } from '@/app/services/fetchData';
import Navbar from '@/components/Navbar';
import { hideLoader, showLoader } from '@/lib/features/loader/loaderSlice';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

export default function CreateResource({ id }: { id: string }) {
  const [content, setContent] = useState('');

  const dispatch = useDispatch();

  const saveResource = async () => {
    try {
      dispatch(showLoader('saving resource'));
      const response = await fetchData('post', `/resources/save/${id}`, {
        content,
      });

      if (response.data.success) {
        toast.success('Resource saved successfully!');
        setContent('');
        window.location.href = '/resources';
      } else {
        toast.error('Failed to save resource.');
      }
    } catch (error) {
      toast.error('Failed to save resource.');
      console.error(error);
    } finally {
      dispatch(hideLoader('saving resource'));
    }
  };
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
                [
                  { header: "1" },
                  { header: "2" },
                  { header: "3" },
                  "blockquote",
                  "code-block",
                ],
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
          onClick={saveResource}
          className="rounded-lg bg-blue-500 px-4 py-2 text-white"
        >
          Save Resource
        </button>
      </div>
    </>
  );
}
