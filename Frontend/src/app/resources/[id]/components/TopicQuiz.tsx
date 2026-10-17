import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import type { TopicQuizData } from './resourceTypes';

type Question = NonNullable<TopicQuizData['questions']>[number];

function QuestionCard({
  question,
  index,
  answer,
  onSelect,
}: {
  question: Question;
  index: number;
  answer: string | undefined;
  onSelect: (questionId: string, text: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-border/40 bg-card/40 p-8 shadow-sm transition-all duration-300 hover:border-primary/20 hover:shadow-md">
      <div className="mb-6 flex items-start">
        <span className="mr-4 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
          {index + 1}
        </span>
        <p className="text-xl font-semibold leading-tight text-foreground">
          {question.question}
        </p>
      </div>
      <div className="grid gap-3 pl-12 xl:grid-cols-2">
        {question?.options?.map((option) => {
          const checked = answer === option.text;
          return (
            <label
              key={option.id}
              className={`duration-250 group relative flex cursor-pointer items-center rounded-xl border p-4 transition-all ${
                checked
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : 'border-border/50 bg-secondary/30 hover:border-primary/40 hover:bg-secondary/50'
              }`}
            >
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${
                      checked
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground/30 group-hover:border-primary/50'
                    }`}
                  >
                    {checked && (
                      <div className="h-2 w-2 rounded-full bg-background" />
                    )}
                  </div>
                  <span className="text-base font-medium">{option.text}</span>
                </div>
                <input
                  type="radio"
                  name={`question-${index}`}
                  value={option.text}
                  checked={checked}
                  onChange={() => onSelect(question.id, option.text)}
                  className="sr-only"
                />
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}

export function TopicQuiz({
  quiz,
  topicTitle,
  userAnswers,
  onSelect,
  onSubmit,
}: {
  quiz: TopicQuizData | null;
  topicTitle: string | undefined;
  userAnswers: Record<string, string>;
  onSelect: (questionId: string, text: string) => void;
  onSubmit: () => void;
}) {
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
        Quiz: {topicTitle}
      </h2>
      <div className="space-y-10">
        {quiz?.questions?.map((question, index) => (
          <QuestionCard
            key={question.id}
            question={question}
            index={index}
            answer={userAnswers[question.id]}
            onSelect={onSelect}
          />
        ))}
      </div>
      <div className="mt-12 flex justify-end">
        <Button
          onClick={onSubmit}
          className="h-14 rounded-2xl bg-primary px-12 text-lg font-bold text-white shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-primary/20 active:scale-[0.98]"
        >
          Submit Quiz
        </Button>
      </div>
    </motion.div>
  );
}
