'use client';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import { useAxiosPost } from '@/hooks/useAxios';

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
    <div>
      <h1>Quiz for Topic {topicId}</h1>
      <button onClick={handleQuizSubmit}>Submit Quiz</button>
    </div>
  );
}
