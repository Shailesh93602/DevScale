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
import { logger } from '@/lib/logger';

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
  const [getInterviewQuestions] = useAxiosGet<
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
  >('/resources/interview-questions');

  const fetchInterviewQuestions = async () => {
    try {
      dispatch(showLoader('fetching interview questions'));
      const response = await getInterviewQuestions();
      dispatch(hideLoader('fetching interview questions'));
      setInterviewQuestions(response.data ?? []);
    } catch (error) {
      logger.error('Error fetching interview questions:', error);
      dispatch(hideLoader('fetching interview questions'));
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchInterviewQuestions();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary to-accent py-12">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <h1 className="mb-12 text-center text-5xl font-extrabold tracking-tight text-primary">
          Interview Questions
        </h1>
        {interviewQuestions.map((category) => (
          <div key={category.category} className="mb-12">
            <h2 className="mb-6 text-3xl font-bold text-primary">
              {category.category}
            </h2>
            <Accordion type="single" collapsible className="w-full space-y-6">
              {category.questions.map((item) => (
                <AccordionItem
                  key={item.id}
                  value={item.id}
                  className="overflow-hidden rounded-xl border border-border bg-card shadow-lg"
                >
                  <AccordionTrigger className="px-8 py-6 transition-colors duration-300 ease-in-out hover:bg-accent">
                    <span className="text-left text-xl font-semibold text-card-foreground">
                      {item.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="bg-muted px-8 py-6">
                    <div className="text-lg leading-relaxed text-muted-foreground">
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
