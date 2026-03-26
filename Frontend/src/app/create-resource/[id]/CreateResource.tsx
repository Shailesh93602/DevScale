'use client';
import Navbar from '@/components/Navbar';
import { useAxiosPost } from '@/hooks/useAxios';
import { hideLoader, showLoader } from '@/lib/features/loader/loaderSlice';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';

export default function CreateResource({ id }: { id: string }) {
  const [content, setContent] = useState('');

  const dispatch = useDispatch();
  const [updateResource] = useAxiosPost<{ success?: boolean }>(
    '/resources/save/{{resourceId}}',
  );

  const saveResource = async () => {
    try {
      dispatch(showLoader('saving resource'));
      const response = await updateResource(
        { content },
        {},
        { resourceId: id },
      );

      if (response.data?.success) {
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
        <Button onClick={saveResource}>Save Resource</Button>
      </div>
    </>
  );
}
