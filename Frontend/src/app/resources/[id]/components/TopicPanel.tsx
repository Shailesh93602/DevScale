import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FaQuestionCircle } from 'react-icons/fa';
import { BookOpen, CheckCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { sanitizeContent } from '@/lib/sanitize-html';

const ARTICLE_PROSE_CLASS =
  'prose prose-base max-w-none dark:prose-invert md:prose-lg prose-headings:text-foreground prose-h2:text-3xl prose-p:leading-relaxed prose-a:text-primary hover:prose-a:text-primary2 prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:text-muted-foreground prose-code:before:content-none prose-code:after:content-none prose-pre:rounded-xl prose-pre:border prose-pre:border-border/50 prose-pre:bg-muted prose-pre:text-muted-foreground prose-li:marker:text-primary prose-img:rounded-xl prose-img:shadow-lg prose-hr:border-border/40';

export function EnrollControl({
  isEnrolled,
  isEnrolling,
  onEnroll,
}: {
  isEnrolled: boolean;
  isEnrolling: boolean;
  onEnroll: () => void;
}) {
  return (
    <div className="mb-6">
      {!isEnrolled ? (
        <Button
          onClick={onEnroll}
          disabled={isEnrolling}
          className="shadow-primary/20 rounded-xl bg-primary px-6 font-bold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {isEnrolling ? 'Enrolling...' : 'Enroll in Roadmap'}
        </Button>
      ) : (
        <div className="inline-flex animate-fade-up items-center gap-2 rounded-xl border border-success/20 bg-success/10 px-6 py-2 text-sm font-bold text-success">
          <CheckCircle2 size={16} />
          <span>Enrolled</span>
        </div>
      )}
    </div>
  );
}

const tabClass = (active: boolean) =>
  `flex items-center rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
    active
      ? 'bg-primary/20 hover:bg-primary/30 text-primary shadow-sm'
      : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
  }`;

export function TopicTabs({
  activeTab,
  onChange,
}: {
  activeTab: string;
  onChange: (tab: string) => void;
}) {
  return (
    <div className="mb-8 flex space-x-2 border-b border-border/40 pb-3">
      <Button
        variant="ghost"
        className={tabClass(activeTab === 'content')}
        onClick={() => onChange('content')}
      >
        <BookOpen className="mr-2.5 h-4 w-4" /> Content
      </Button>
      <Button
        variant="ghost"
        className={tabClass(activeTab === 'quiz')}
        onClick={() => onChange('quiz')}
      >
        <FaQuestionCircle className="mr-2.5 h-4 w-4" /> Quiz
      </Button>
    </div>
  );
}

export function MarkCompletedButton({
  isCompleted,
  isUpdating,
  onClick,
}: {
  isCompleted: boolean | undefined;
  isUpdating: boolean;
  onClick: () => void;
}) {
  let label: ReactNode = 'Mark as Completed';
  if (isUpdating) label = 'Updating...';
  else if (isCompleted) {
    label = (
      <>
        <CheckCircle className="mr-2 h-4 w-4" />
        Completed
      </>
    );
  }
  return (
    <div className="mb-6 flex justify-end">
      <Button
        variant={isCompleted ? 'outline' : 'default'}
        onClick={onClick}
        disabled={isUpdating}
        className={`h-12 rounded-xl px-8 font-bold transition-all duration-300 ${
          isCompleted
            ? 'border-primary/30 hover:bg-primary/5 text-primary'
            : 'shadow-primary/25 hover:bg-primary/90 bg-primary text-white shadow-lg'
        }`}
      >
        {label}
      </Button>
    </div>
  );
}

/** Loading skeleton, sanitised article or quiz, cross-faded. */
export function TopicBody({
  isArticleLoading,
  activeTab,
  articleContent,
  quiz,
}: {
  isArticleLoading: boolean;
  activeTab: string;
  articleContent: string;
  quiz: ReactNode;
}) {
  return (
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
          className={ARTICLE_PROSE_CLASS}
          dangerouslySetInnerHTML={{ __html: sanitizeContent(articleContent) }}
        ></motion.div>
      ) : (
        <motion.div
          key="quiz"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          {quiz}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
