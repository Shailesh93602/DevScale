'use client';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import DOMPurify from 'dompurify';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes, FaBook, FaQuestionCircle } from 'react-icons/fa';
import { useAxiosGet, useAxiosPost } from '@/hooks/useAxios';
import { IResource } from '@/constants';

const sanitizeContent = (content: string) => {
  return DOMPurify.sanitize(content);
};

interface ResourceType {
  id: string;
  title: string;
}

interface ITopic {
  id: string;
  order: number;
  topic: {
    id: string;
    title: string;
    description: string;
  };
}

export default function Resources({ id }: { id: string }) {
  const [resource, setResource] = useState<ResourceType[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<ResourceType>();
  const [currentArticle, setCurrentArticle] = useState<{
    content: string;
  } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quiz, setQuiz] = useState<{
    id: string;
    questions?: {
      id: string;
      question: string;
      options: { id: string; answerText: string }[];
    }[];
  } | null>(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [activeTab, setActiveTab] = useState('content');
  const [getResource] = useAxiosGet<ITopic[]>('/subjects/{{subjectId}}/topics');
  const [getQuiz] = useAxiosGet<{
    success?: boolean;
    quiz?: {
      id: string;
      questions?: {
        id: string;
        question: string;
        options: { id: string; answerText: string }[];
      }[];
    };
  }>('/topics/{{topicId}}/quiz');
  const [submitQuiz] = useAxiosPost<{
    success?: boolean;
    completed?: boolean;
    message?: string;
  }>('/quiz/submit');
  const [getArticle] = useAxiosGet<{
    success?: boolean;
    article?: { content: string };
  }>('/topics/{{topicId}}/article');

  const fetchResource = async () => {
    try {
      const response = await getResource({}, { subjectId: id });

      console.log('🚀 ----------------------------------------🚀');
      console.log('🚀 ~ fetchResource ~ response:', response);
      console.log('🚀 ----------------------------------------🚀');

      if (!response?.error) {
        const topics =
          response?.data
            ?.sort((a, b) => a.order - b.order)
            ?.map((item) => item.topic) ?? [];
        setResource(topics);
        setSelectedTopic(
          topics[0] ?? {
            id: '',
            title: '',
          },
        );
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
      if (response.data?.success) {
        setCurrentArticle(response.data.article || null);
      } else {
        setCurrentArticle(null);
        toast.error('Failed to fetch article content');
      }
    } catch (error) {
      setCurrentArticle(null);
      toast.error('Failed to fetch article content');
      console.error(error);
    }
  };

  useEffect(() => {
    fetchResource();
  }, [id]);

  useEffect(() => {
    if (selectedTopic?.id) {
      fetchArticle(selectedTopic.id);
    }
  }, [selectedTopic]);

  useEffect(() => {
    const fetchQuiz = async () => {
      if (selectedTopic) {
        try {
          const response = await getQuiz({}, { topicId: selectedTopic.id });
          const data = response.data;
          if (data) {
            setQuiz(data?.quiz ?? null);
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
    const answers = Object.entries(userAnswers).map(([questionId, answer]) => ({
      questionId: parseInt(questionId),
      answer,
    }));

    try {
      const response = await submitQuiz({
        quizId: quiz?.id,
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
        className="mb-8 rounded-lg bg-white p-8 shadow-xl transition-all duration-300 hover:shadow-2xl dark:bg-gray-800"
      >
        <h2 className="mb-6 border-b border-gray-200 pb-2 text-3xl font-bold text-gray-800 dark:border-gray-700 dark:text-gray-200">
          Quiz: {selectedTopic?.title}
        </h2>
        {quiz?.questions?.map((question, index) => (
          <div key={question.id} className="mb-6">
            <p className="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-300">{`${
              index + 1
            }. ${question.question}`}</p>
            <ul className="list-none pl-5">
              {question?.options?.map((option) => (
                <li key={option.id} className="mb-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={option.answerText}
                      checked={
                        userAnswers[question.id as keyof object] ===
                        option.answerText
                      }
                      onChange={() =>
                        handleAnswerSelect(question.id, option.answerText)
                      }
                      className="mr-2 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                      {option.answerText}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <button
          onClick={handleSubmitQuiz}
          className="mt-4 transform rounded-full bg-blue-600 px-6 py-3 text-white transition duration-300 hover:scale-105 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Submit Quiz
        </button>
      </motion.div>
    );
  };

  if (!resource) {
    toast.error('Requested resource not found.');
    return;
  }

  return (
    <div className="flex flex-col md:flex-row">
      <button
        className="fixed right-4 top-4 z-20 rounded-full bg-primary p-3 text-white shadow-lg transition-all duration-300 hover:bg-primary2 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-opacity-50 md:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? (
          <FaTimes className="h-6 w-6" />
        ) : (
          <FaBars className="h-6 w-6" />
        )}
      </button>
      <motion.div
        initial={{ x: '0' }}
        animate={{ x: sidebarOpen || window.innerWidth >= 768 ? 0 : '-100%' }}
        transition={{ duration: 0.3 }}
        className={`fixed inset-y-0 left-0 z-10 max-h-screen w-full overflow-y-auto overflow-y-scroll bg-lightSecondary p-5 shadow-lg md:w-3/12 lg:w-2/12 ${
          window.innerWidth >= 768 ? 'relative translate-x-0' : ''
        }`}
      >
        <h2 className="mb-6 border-b border-border pb-2 text-2xl font-bold">
          Topics
        </h2>
        <ul className="space-y-2">
          {resource.map((topic) => (
            <motion.li
              key={topic.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`cursor-pointer rounded-lg p-3 transition duration-300 hover:bg-primary2 hover:text-white ${
                selectedTopic?.id === topic.id
                  ? 'bg-primary text-white shadow-md'
                  : 'hover:shadow-md'
              }`}
              onClick={() => {
                setSelectedTopic(topic);
                setSidebarOpen(false);
              }}
            >
              {topic.title}
            </motion.li>
          ))}
        </ul>
      </motion.div>

      <div className="w-full overflow-y-auto p-5 md:w-9/12 md:p-10 lg:w-10/12">
        {selectedTopic && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 rounded-lg bg-lightSecondary p-8 shadow-xl transition-all duration-300 hover:shadow-2xl"
          >
            <h1 className="mb-6 border-b border-border pb-2 text-4xl font-bold">
              {selectedTopic.title}
            </h1>
            <div className="mb-4 flex border-b border-border">
              <button
                className={`mr-4 px-4 py-2 hover:text-primary2 focus:outline-none ${
                  activeTab === 'content'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-grayText'
                }`}
                onClick={() => setActiveTab('content')}
              >
                <FaBook className="mr-2 inline-block" /> Content
              </button>
              <button
                className={`px-4 py-2 hover:text-primary2 focus:outline-none ${
                  activeTab === 'quiz'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-grayText'
                }`}
                onClick={() => setActiveTab('quiz')}
              >
                <FaQuestionCircle className="mr-2 inline-block" /> Quiz
              </button>
            </div>
            <AnimatePresence mode="wait">
              {activeTab === 'content' ? (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="prose max-w-none dark:prose-invert"
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
      </div>
    </div>
  );
}
