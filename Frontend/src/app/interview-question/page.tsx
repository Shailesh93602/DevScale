'use client';
import React, { useEffect, useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import { useDispatch } from 'react-redux';
import { hideLoader, showLoader } from '@/lib/features/loader/loaderSlice';
import { useAxiosGet } from '@/hooks/useAxios';

const Page = () => {
  const [interviewQuestions, setInterviewQuestions] = useState<
    {
      category: string;
      questions: {
        id: string;
        question: string;
        answer: {
          introduction: string;
          description: string;
          conclusion: string;
          points: { id: string; title: string; description: string }[];
        };
      }[];
    }[]
  >([]);

  const dispatch = useDispatch();
  const [getInterviewQuestions] = useAxiosGet<{
    resource: {
      category: string;
      questions: {
        id: string;
        question: string;
        answer: {
          introduction: string;
          description: string;
          conclusion: string;
          points: { id: string; title: string; description: string }[];
        };
      }[];
    }[];
  }>('/resources/interview-questions');

  const fetchInterviewQuestions = async () => {
    try {
      dispatch(showLoader('fetching interview questions'));
      const response = await getInterviewQuestions();
      dispatch(hideLoader('fetching interview questions'));
      setInterviewQuestions(response.data?.resource ?? []);
    } catch (error) {
      console.error(error);
      dispatch(hideLoader('fetching interview questions'));
    }
  };

  useEffect(() => {
    fetchInterviewQuestions();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 py-12 dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <h1 className="mb-12 text-center text-5xl font-extrabold tracking-tight text-indigo-800 dark:text-indigo-300">
          Interview Questions
        </h1>
        {interviewQuestions.map((category) => (
          <div key={category.category} className="mb-12">
            <h2 className="mb-6 text-3xl font-bold text-indigo-700 dark:text-indigo-400">
              {category.category}
            </h2>
            <Accordion type="single" collapsible className="w-full space-y-6">
              {category.questions.map((item) => (
                <AccordionItem
                  key={item.id}
                  value={item.id}
                  className="overflow-hidden rounded-xl border border-indigo-100 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
                >
                  <AccordionTrigger className="px-8 py-6 transition-colors duration-300 ease-in-out hover:bg-indigo-50 dark:hover:bg-gray-700">
                    <span className="text-left text-xl font-semibold text-gray-800 dark:text-gray-200">
                      {item.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="bg-indigo-50 px-8 py-6 dark:bg-gray-700">
                    <div className="text-lg leading-relaxed text-gray-600 dark:text-gray-300">
                      <p className="mb-4">{item.answer.introduction}</p>
                      <ul className="mb-4 list-disc space-y-2 pl-5">
                        {item.answer.points.map((point) => (
                          <li key={point.id}>
                            <strong>{point.title}:</strong> {point.description}
                          </li>
                        ))}
                      </ul>
                      <p>{item.answer.conclusion}</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Page;
