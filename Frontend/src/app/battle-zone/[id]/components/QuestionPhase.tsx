import { ChevronRight, Loader2, Swords, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { AnswerResult } from '@/types/battle';
import { OPTION_LETTERS } from './battleDisplay';
import type { LoadedBattleState } from './shared';

interface OptionState {
  isSelected: boolean;
  isAnswered: boolean;
  isCorrect: boolean;
  isWrong: boolean;
}

function optionState(
  idx: number,
  selectedOption: number | null,
  answerResult: AnswerResult | null,
  isAnswered: boolean,
): OptionState {
  const isSelected = selectedOption === idx;
  return {
    isSelected,
    isAnswered,
    isCorrect: !!answerResult && idx === answerResult.correct_answer,
    isWrong: !!answerResult && isSelected && !answerResult.is_correct,
  };
}

function optionButtonClass(o: OptionState): string {
  return `flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all ${o.isCorrect ? 'border-green-500 bg-green-500/10 text-green-700' : ''} ${o.isWrong ? 'border-destructive bg-destructive/10 text-destructive' : ''} ${!o.isAnswered && o.isSelected ? 'bg-primary/10 border-primary' : ''} ${!o.isAnswered && !o.isSelected ? 'hover:border-primary/50 hover:bg-muted/50' : ''} ${o.isAnswered && !o.isCorrect && !o.isWrong ? 'opacity-60' : ''} `;
}

function optionLetterClass(o: OptionState): string {
  return `flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${o.isSelected && !o.isAnswered ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30'} ${o.isCorrect ? 'border-green-500 bg-green-500 text-white' : ''} ${o.isWrong ? 'border-destructive bg-destructive text-destructive-foreground' : ''} `;
}

function AnswerFeedback({ result }: { result: AnswerResult }) {
  return (
    <div
      className={`rounded-xl border p-4 ${result.is_correct ? 'border-green-500/30 bg-green-500/5' : 'border-destructive/30 bg-destructive/5'}`}
    >
      <p
        className={`font-semibold ${result.is_correct ? 'text-green-600' : 'text-destructive'}`}
      >
        {result.is_correct
          ? `✓ Correct! +${result.points_earned} points`
          : '✗ Incorrect — 0 points'}
      </p>
      {result.explanation && (
        <p className="mt-1 text-sm text-muted-foreground">
          {result.explanation}
        </p>
      )}
    </div>
  );
}

function NoQuestions() {
  return (
    <div className="flex flex-col items-center rounded-xl border bg-card py-12 text-center">
      <Swords className="mb-4 h-10 w-10 text-muted-foreground" />
      <h3 className="text-lg font-semibold">No questions yet</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        This battle has no questions loaded. The creator needs to add questions.
      </p>
    </div>
  );
}

export function QuestionPhase({ s }: { s: LoadedBattleState }) {
  const {
    currentQuestion,
    currentQuestionIndex,
    questions,
    secondsRemaining,
    selectedOption,
    answerResult,
    actionLoading,
  } = s;
  if (!currentQuestion) return <NoQuestions />;

  const isAnswered = s.answeredQuestions.has(currentQuestion.id);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Badge variant="outline">
          Question {currentQuestionIndex + 1} / {questions.length}
        </Badge>
        <div className="flex items-center gap-2 text-sm font-medium">
          <Timer className="h-4 w-4 text-muted-foreground" />
          <span
            className={
              secondsRemaining !== null && secondsRemaining <= 10
                ? 'font-bold text-destructive'
                : ''
            }
          >
            {secondsRemaining ?? currentQuestion.time_limit}s
          </span>
        </div>
        <Badge variant="secondary">{currentQuestion.points} pts</Badge>
      </div>

      {/* Timer bar */}
      {secondsRemaining !== null && (
        <Progress
          value={(secondsRemaining / currentQuestion.time_limit) * 100}
          className="h-1"
        />
      )}

      <div className="rounded-xl border bg-card p-6">
        <p className="text-lg font-semibold leading-relaxed">
          {currentQuestion.question}
        </p>
      </div>

      <div className="grid gap-3">
        {currentQuestion.options.map((option, idx) => {
          const o = optionState(idx, selectedOption, answerResult, isAnswered);
          return (
            <button
              key={idx}
              onClick={() => !isAnswered && s.setSelectedOption(idx)}
              disabled={isAnswered}
              className={optionButtonClass(o)}
            >
              <span className={optionLetterClass(o)}>
                {OPTION_LETTERS[idx]}
              </span>
              <span>{option}</span>
            </button>
          );
        })}
      </div>

      {answerResult && <AnswerFeedback result={answerResult} />}

      {!isAnswered && (
        <Button
          className="w-full"
          size="lg"
          onClick={s.handleSubmitAnswer}
          disabled={selectedOption === null || actionLoading}
        >
          {actionLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Submit Answer
        </Button>
      )}

      {isAnswered && currentQuestionIndex < questions.length - 1 && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <ChevronRight className="h-4 w-4" />
          Next question will appear automatically
        </div>
      )}
    </div>
  );
}
