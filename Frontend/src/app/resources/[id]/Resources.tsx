'use client';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useRoadmapEnrollment } from './components/useRoadmapEnrollment';
import { useResourceTopics } from './components/useResourceTopics';
import { useTopicQuiz } from './components/useTopicQuiz';
import { ResourcesSkeleton, TopicsSidebar } from './components/TopicsSidebar';
import { TopicQuiz } from './components/TopicQuiz';
import {
  EnrollControl,
  MarkCompletedButton,
  TopicBody,
  TopicTabs,
} from './components/TopicPanel';

export default function Resources({ id }: { id: string }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [activeTab, setActiveTab] = useState('content');
  const roadmapId = useSearchParams().get('roadmapId');

  const enrollment = useRoadmapEnrollment(roadmapId);
  const t = useResourceTopics(id);
  const { selectedTopic } = t;
  const quiz = useTopicQuiz(selectedTopic);

  if (t.isTopicsLoading) {
    return <ResourcesSkeleton />;
  }

  if (!t.resource) {
    toast.error(
      'That resource does not exist. It may have been removed. Please choose another.',
    );
    return;
  }

  return (
    <div className="relative flex min-h-[calc(100vh-60px)] flex-col bg-background lg:flex-row">
      <TopicsSidebar
        topics={t.resource}
        selectedTopicId={selectedTopic?.topic?.id}
        onSelect={t.setSelectedTopic}
        isDesktop={isDesktop}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <main className="min-w-0 flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
        {selectedTopic && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative mb-8 overflow-hidden rounded-2xl border border-border/40 bg-card p-6 shadow-2xl transition-all duration-500 hover:shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)] md:p-10"
          >
            {/* Decorative background blur */}
            <div className="absolute -right-40 -top-40 -z-10 h-96 w-96 rounded-full bg-primary/20 blur-3xl"></div>
            <h1 className="mb-4 border-b border-border/40 bg-gradient-to-r from-primary via-primary2 to-purple bg-clip-text pb-4 text-3xl font-extrabold tracking-tight text-transparent md:text-5xl">
              {selectedTopic?.topic?.title}
            </h1>

            {roadmapId && (
              <EnrollControl
                isEnrolled={enrollment.isEnrolled}
                isEnrolling={enrollment.isEnrolling}
                onEnroll={enrollment.handleEnroll}
              />
            )}

            <TopicTabs activeTab={activeTab} onChange={setActiveTab} />

            <MarkCompletedButton
              isCompleted={selectedTopic?.topic?.isCompleted}
              isUpdating={t.isUpdatingProgress}
              onClick={t.handleMarkCompleted}
            />
            <TopicBody
              isArticleLoading={t.isArticleLoading}
              activeTab={activeTab}
              articleContent={t.currentArticle?.content || ''}
              quiz={
                <TopicQuiz
                  quiz={quiz.quiz}
                  topicTitle={selectedTopic?.topic?.title}
                  userAnswers={quiz.userAnswers}
                  onSelect={quiz.handleAnswerSelect}
                  onSubmit={quiz.handleSubmitQuiz}
                />
              }
            />
          </motion.div>
        )}
      </main>
    </div>
  );
}
