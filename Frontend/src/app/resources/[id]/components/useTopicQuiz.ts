import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAxiosGet, useAxiosPost } from '@/hooks/useAxios';
import type { ResourceType, TopicQuizData } from './resourceTypes';

/** Loads the selected topic's quiz (again whenever the topic object changes) and submits answers. */
export function useTopicQuiz(selectedTopic: ResourceType | undefined) {
  const [quiz, setQuiz] = useState<TopicQuizData | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [getQuiz] = useAxiosGet<TopicQuizData>('/topics/{{topicId}}/quiz');
  const [submitQuiz] = useAxiosPost<{
    success?: boolean;
    completed?: boolean;
    message?: string;
  }>('/quiz/submit');

  useEffect(() => {
    const fetchQuiz = async () => {
      if (selectedTopic?.topic?.id) {
        try {
          const response = await getQuiz(
            {},
            { topicId: selectedTopic.topic.id },
          );
          if (response.success && response.data) {
            setQuiz(response.data);
          } else {
            setQuiz(null);
          }
        } catch (error) {
          toast.error('Unable to load the quiz. Please refresh the page.');
          setQuiz(null);
          console.error(error);
        }
      }
    };
    fetchQuiz();
  }, [selectedTopic]);

  const handleAnswerSelect = (questionId: string, selectedAnswer: string) => {
    setUserAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: selectedAnswer,
    }));
  };

  const handleSubmitQuiz = async () => {
    const answers = Object.entries(userAnswers).map(
      ([question_id, answer]) => ({ question_id, answer }),
    );

    try {
      const response = await submitQuiz({ quiz_id: quiz?.id, answers });
      const data = response.data;

      if (data?.success) {
        toast.success('Quiz submitted successfully!');
        if (data?.completed) {
          toast.success('You have passed the quiz!');
        } else {
          toast.info('You did not pass the quiz.');
        }
      } else {
        // Never a bare `data?.message`: with no server message the toast would be empty.
        toast.error(
          data?.message ?? 'Could not submit your quiz. Please try again.',
        );
      }
    } catch (error) {
      toast.error('Error submitting quiz. Please try again!');
      console.error(error);
    }
  };

  return { quiz, userAnswers, handleAnswerSelect, handleSubmitQuiz };
}
