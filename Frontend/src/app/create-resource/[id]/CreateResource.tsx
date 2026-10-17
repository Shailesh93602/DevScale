'use client';
import Navbar from '@/components/Navbar';
import { useAxiosPost } from '@/hooks/useAxios';
import { hideLoader, showLoader } from '@/lib/features/loader/loaderSlice';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function CreateResource({ id }: { id: string }) {
  const [content, setContent] = useState('');

  const dispatch = useDispatch();
  const [updateResource] = useAxiosPost<unknown>(
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

      if (response.success) {
        toast.success('Resource saved successfully!');
        setContent('');
        window.location.href = '/resources';
      } else {
        toast.error('Unable to save this resource. Please try again.');
      }
    } catch (error) {
      toast.error('Unable to save this resource. Please try again.');
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
          <Textarea
            aria-label="Resource content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={20}
            className="font-mono"
          />
        </div>
        <Button onClick={saveResource}>Save Resource</Button>
      </div>
    </>
  );
}
