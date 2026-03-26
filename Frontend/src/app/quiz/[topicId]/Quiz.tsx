'use client';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { useAxiosPost } from '@/hooks/useAxios';
import { Button } from '@/components/ui/button';

export default function Quiz({ topicId }: { topicId: string }) {
  const [score] = useState(0);
  const router = useRouter();
  const [submitQuiz] = useAxiosPost<{ success?: boolean }>('/quizzes/submit');

  const handleQuizSubmit = async () => {
    try {
      const response = await submitQuiz({ topicId, score });

      if (response.data?.success) {
        toast.success('Quiz submitted successfully!');
        router.push('/profile');
      } else {
        toast.error('Failed to submit quiz.');
      }
    } catch (error) {
      toast.error('Error submitting quiz.');
      console.error(error);
    }
  };
  return (
    <div className="container mx-auto p-8">
      <h1 className="mb-6 text-3xl font-bold">Quiz for Topic {topicId}</h1>
      <Button onClick={handleQuizSubmit}>Submit Quiz</Button>
    </div>
  );
}
