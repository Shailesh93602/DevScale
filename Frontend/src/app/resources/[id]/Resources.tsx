'use client';
import React, { useEffect, useState } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { toast } from 'react-toastify';
import DOMPurify from 'dompurify';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaQuestionCircle,
} from 'react-icons/fa';
import { CheckCircle, CheckCircle2, Menu, X, BookOpen } from 'lucide-react';
import { useAxiosGet, useAxiosPost } from '@/hooks/useAxios';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
const sanitizeContent = (content: string) => {
  return DOMPurify.sanitize(content);
};

interface ResourceType {
  id: string;
  topic: {
    id: string;
    title: string;
    description: string;
    order: number;
    isCompleted?: boolean;
  };
}

export default function Resources({ id }: { id: string }) {
  const [resource, setResource] = useState<ResourceType[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<ResourceType>();
  const [currentArticle, setCurrentArticle] = useState<{
    content: string;
  } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [quiz, setQuiz] = useState<{
    id: string;
    questions?: {
      id: string;
      question: string;
      options: { id: string; text: string }[];
    }[];
  } | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('content');
  const [getResource, { isLoading: isTopicsLoading }] = useAxiosGet<{
    topics: ResourceType[];
  }>('/subjects/{{subjectId}}/topics');
  const [getQuiz] = useAxiosGet<{
    id: string;
    questions?: {
      id: string;
      question: string;
      options: { id: string; text: string }[];
    }[];
  }>('/topics/{{topicId}}/quiz');
  const [submitQuiz] = useAxiosPost<{
    success?: boolean;
    completed?: boolean;
    message?: string;
  }>('/quiz/submit');
  const [getArticle, { isLoading: isArticleLoading }] = useAxiosGet<
    {
      id: string;
      title: string;
      content: string;
    }[]
  >('/topics/{{topicId}}/article');
  const [updateProgress, { isLoading: isUpdatingProgress }] = useAxiosPost<{
    success?: boolean;
    message?: string;
  }>('/progress/update');

  const searchParams = useSearchParams();
  const roadmapId = searchParams.get('roadmapId');
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollInRoadmap] = useAxiosPost('/roadmaps/enroll');
  const [getRoadmapDetails] = useAxiosGet<{ isEnrolled: boolean }>(
    '/roadmaps/{{roadmapId}}',
  );

  useEffect(() => {
    if (roadmapId) {
      getRoadmapDetails({}, { roadmapId })
        .then((resp) => {
          if (resp?.success && resp?.data?.isEnrolled) {
            setIsEnrolled(true);
          }
        })
        .catch(console.error);
    }
  }, [roadmapId, getRoadmapDetails]);

  const handleEnroll = async () => {
    if (isEnrolling || !roadmapId) return;
    setIsEnrolling(true);
    try {
      const response = await enrollInRoadmap({ roadmapId });
      if (response?.success) {
        setIsEnrolled(true);
        if (response.message?.toLowerCase().includes('already')) {
          toast.info("You're already enrolled in this roadmap");
        } else {
          toast.success("Awesome! You're now enrolled ✨");
        }
      } else {
        toast.error('Failed to enroll. Please try again.');
      }
    } catch (e) {
      toast.error('Failed to enroll. Please try again.');
    } finally {
      setIsEnrolling(false);
    }
  };

  const fetchResource = async () => {
    try {
      const response = await getResource({}, { subjectId: id });

      if (response && !response?.error) {
        const topics =
          response?.data?.topics?.sort(
            (a, b) => a?.topic?.order - b?.topic?.order,
          ) ?? [];
        setResource(topics);
        setSelectedTopic(topics[0] || undefined);
      } else {
        toast.error(
          response?.message ?? 'Failed to fetch resource. Please try again!',
        );
      }
    } catch (error) {
      toast.error('Failed to fetch resource. Please try again!');
      console.error(error);
    }
  };

  const fetchArticle = async (topicId: string) => {
    try {
      const response = await getArticle({}, { topicId });
      if (response.success && response.data && response.data.length > 0) {
        setCurrentArticle(response.data[0]);
      } else {
        setCurrentArticle(null);
        if (response.success) {
          toast.info('No article found for this topic');
        } else {
          toast.error('Failed to fetch article content');
        }
      }
    } catch (error) {
      setCurrentArticle(null);
      toast.error('Failed to fetch article content');
      console.error(error);
    }
  };

  const handleMarkCompleted = async () => {
    if (!selectedTopic?.topic?.id) return;

    try {
      const response = await updateProgress({
        topicId: selectedTopic.topic.id,
        status: selectedTopic.topic.isCompleted ? 'in_progress' : 'completed',
        score: 10,
      });

      if (response.success) {
        toast.success(
          selectedTopic.topic.isCompleted
            ? 'Topic marked as in progress'
            : 'Topic marked as completed',
        );
        // fetchResource(); // Avoid re-fetching and skeleton loader

        // Use local state update instead of re-fetching
        const isCompleted = !selectedTopic.topic.isCompleted;

        setResource((prev) =>
          prev.map((item) =>
            item.topic.id === selectedTopic.topic.id
              ? { ...item, topic: { ...item.topic, isCompleted } }
              : item,
          ),
        );

        setSelectedTopic((prev) =>
          prev
            ? {
                ...prev,
                topic: { ...prev.topic, isCompleted },
              }
            : undefined,
        );
      } else {
        toast.error('Failed to update progress');
      }
    } catch (e) {
      toast.error('Error updating progress');
    }
  };

  useEffect(() => {
    fetchResource();
  }, [id]);

  useEffect(() => {
    if (selectedTopic?.topic?.id) {
      fetchArticle(selectedTopic.topic.id);
    }
  }, [selectedTopic]);

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
          toast.error('Failed to fetch quiz. Please try again!');
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
      ([question_id, answer]) => ({
        question_id,
        answer,
      }),
    );

    try {
      const response = await submitQuiz({
        quiz_id: quiz?.id,
        answers,
      });
      const data = response.data;

      if (data?.success) {
        toast.success('Quiz submitted successfully!');
        if (data?.completed) {
          toast.success('You have passed the quiz!');
        } else {
          toast.info('You did not pass the quiz.');
        }
      } else {
        toast.error(data?.message);
      }
    } catch (error) {
      toast.error('Error submitting quiz. Please try again!');
      console.error(error);
    }
  };

  const renderQuiz = () => {
    if (!quiz) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h2 className="mb-8 border-b border-border/40 pb-4 text-3xl font-bold tracking-tight text-foreground">
          Quiz: {selectedTopic?.topic?.title}
        </h2>
        <div className="space-y-10">
          {quiz?.questions?.map((question, index) => (
            <div
              key={question.id}
              className="rounded-2xl border border-border/40 bg-card/40 p-8 shadow-sm transition-all duration-300 hover:border-primary/20 hover:shadow-md"
            >
              <div className="mb-6 flex items-start">
                <span className="mr-4 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                  {index + 1}
                </span>
                <p className="text-xl font-semibold leading-tight text-foreground">
                  {question.question}
                </p>
              </div>
              <div className="grid gap-3 pl-12 xl:grid-cols-2">
                {question?.options?.map((option) => (
                  <label
                    key={option.id}
                    className={`group relative flex cursor-pointer items-center rounded-xl border p-4 transition-all duration-250 ${
                      userAnswers[question.id] === option.text
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border/50 bg-secondary/30 hover:border-primary/40 hover:bg-secondary/50'
                    }`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${
                            userAnswers[question.id] === option.text
                              ? 'border-primary bg-primary'
                              : 'border-muted-foreground/30 group-hover:border-primary/50'
                          }`}
                        >
                          {userAnswers[question.id] === option.text && (
                            <div className="h-2 w-2 rounded-full bg-white" />
                          )}
                        </div>
                        <span className="text-base font-medium">
                          {option.text}
                        </span>
                      </div>
                      <input
                        type="radio"
                        name={`question-${index}`}
                        value={option.text}
                        checked={userAnswers[question.id] === option.text}
                        onChange={() =>
                          handleAnswerSelect(question.id, option.text)
                        }
                        className="sr-only"
                      />
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 flex justify-end">
          <Button
            onClick={handleSubmitQuiz}
            className="h-14 rounded-2xl bg-primary px-12 text-lg font-bold text-white shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-primary/20 active:scale-[0.98]"
          >
            Submit Quiz
          </Button>
        </div>
      </motion.div>
    );
  };

  if (isTopicsLoading) {
    return (
      <div className="flex h-screen flex-col md:flex-row">
        <div className="w-full border-r border-border p-5 md:w-3/12 lg:w-2/12">
          <Skeleton className="mb-6 h-8 w-3/4" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
        <div className="w-full p-5 md:w-9/12 md:p-10 lg:w-10/12">
          <Skeleton className="mb-10 mt-5 h-16 w-3/4" />
          <div className="space-y-6">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!resource) {
    toast.error('Requested resource not found.');
    return;
  }

  return (
    <div className="relative flex flex-col lg:flex-row min-h-[calc(100vh-60px)] bg-background">
      {/* Mobile Sidebar Toggle - Explicitly hidden on desktop via both CSS and JS */}
      <Button
        className={cn(
          "fixed left-4 top-[70px] z-50 h-10 w-10 rounded-full bg-primary/90 p-0 text-white shadow-xl backdrop-blur-sm transition-all duration-300 hover:bg-primary lg:hidden",
          isDesktop && "hidden"
        )}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <motion.div
        initial={false}
        animate={{ x: isDesktop ? 0 : sidebarOpen ? 0 : '-100%' }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={cn(
          'fixed inset-y-0 left-0 z-40 h-full w-[280px] border-r border-border bg-card p-6 shadow-2xl transition-all duration-300',
          'lg:sticky lg:top-[60px] lg:z-10 lg:h-[calc(100vh-60px)] lg:w-[280px] lg:translate-x-0 lg:bg-background lg:shadow-none lg:flex-none xl:w-[300px]',
          !isDesktop && 'overflow-y-auto'
        )}
      >
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Topics
          </h2>
          {sidebarOpen && (
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-foreground/50 hover:text-foreground"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
        <ul className="space-y-2">
          {resource.map((topic) => (
            <li
              key={topic?.id}
              className={`group flex cursor-pointer items-center justify-between rounded-xl px-4 py-3 transition-all duration-200 ${
                selectedTopic?.topic?.id === topic?.topic?.id
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'hover:bg-primary/10 hover:text-primary text-muted-foreground'
              }`}
              onClick={() => {
                setSelectedTopic(topic);
                setSidebarOpen(false);
              }}
            >
              <span className="text-sm font-semibold truncate pr-2">{topic?.topic?.title}</span>
              {topic?.topic?.isCompleted && (
                <CheckCircle
                  size={16}
                  className={
                    selectedTopic?.topic?.id === topic?.topic?.id
                      ? 'text-white'
                      : 'text-primary'
                  }
                />
              )}
            </li>
          ))}
        </ul>
      </motion.div>

      <main className="flex-1 min-w-0 p-4 md:p-8 lg:p-12 overflow-y-auto">
        {selectedTopic && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative mb-8 overflow-hidden rounded-2xl border border-border/40 bg-card p-6 shadow-2xl transition-all duration-500 hover:shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)] md:p-10"
          >
            {/* Decorative background blur */}
            <div className="bg-primary/20 absolute -right-40 -top-40 -z-10 h-96 w-96 rounded-full blur-3xl"></div>
            <h1 className="mb-4 border-b border-border/40 bg-gradient-to-r from-primary via-primary2 to-purple bg-clip-text pb-4 text-3xl font-extrabold tracking-tight text-transparent md:text-5xl">
              {selectedTopic?.topic?.title}
            </h1>

            {roadmapId && (
              <div className="mb-6">
                {!isEnrolled ? (
                  <Button
                    onClick={handleEnroll}
                    disabled={isEnrolling}
                    className="rounded-xl bg-primary px-6 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isEnrolling ? 'Enrolling...' : 'Enroll in Roadmap'}
                  </Button>
                ) : (
                  <div className="inline-flex items-center gap-2 rounded-xl bg-success/10 border border-success/20 px-6 py-2 text-sm font-bold text-success animate-fade-up">
                    <CheckCircle2 size={16} />
                    <span>Enrolled</span>
                  </div>
                )}
              </div>
            )}

            <div className="mb-8 flex space-x-2 border-b border-border/40 pb-3">
              <Button
                variant="ghost"
                className={`flex items-center rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
                  activeTab === 'content'
                    ? 'bg-primary/20 hover:bg-primary/30 text-primary shadow-sm'
                    : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                }`}
                onClick={() => setActiveTab('content')}
              >
                <BookOpen className="mr-2.5 h-4 w-4" /> Content
              </Button>
              <Button
                variant="ghost"
                className={`flex items-center rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
                  activeTab === 'quiz'
                    ? 'bg-primary/20 hover:bg-primary/30 text-primary shadow-sm'
                    : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                }`}
                onClick={() => setActiveTab('quiz')}
              >
                <FaQuestionCircle className="mr-2.5 h-4 w-4" /> Quiz
              </Button>
            </div>

            <div className="mb-6 flex justify-end">
              <Button
                variant={
                  selectedTopic?.topic?.isCompleted ? 'outline' : 'default'
                }
                onClick={handleMarkCompleted}
                disabled={isUpdatingProgress}
                className={`h-12 rounded-xl px-8 font-bold transition-all duration-300 ${
                  selectedTopic?.topic?.isCompleted
                    ? 'border-primary/30 text-primary hover:bg-primary/5'
                    : 'bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary/90'
                }`}
              >
                {isUpdatingProgress ? (
                  'Updating...'
                ) : selectedTopic?.topic?.isCompleted ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Completed
                  </>
                ) : (
                  'Mark as Completed'
                )}
              </Button>
            </div>
            <AnimatePresence mode="wait">
              {isArticleLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                  <Skeleton className="h-4 w-[90%]" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="mt-6 h-32 w-full" />
                </motion.div>
              ) : activeTab === 'content' ? (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="prose prose-base max-w-none dark:prose-invert md:prose-lg prose-headings:text-foreground prose-h2:text-3xl prose-p:leading-relaxed prose-a:text-primary hover:prose-a:text-primary2 prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:text-muted-foreground prose-code:before:content-none prose-code:after:content-none prose-pre:rounded-xl prose-pre:border prose-pre:border-border/50 prose-pre:bg-muted prose-pre:text-muted-foreground prose-li:marker:text-primary prose-img:rounded-xl prose-img:shadow-lg prose-hr:border-border/40"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeContent(currentArticle?.content || ''),
                  }}
                ></motion.div>
              ) : (
                <motion.div
                  key="quiz"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  {renderQuiz()}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </main>
    </div>
  );
}
