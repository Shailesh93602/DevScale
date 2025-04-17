'use client';

import React, { useState, useEffect } from 'react';
import { useAxiosGet, useAxiosPost } from '@/hooks/useAxios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Timer, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Question {
  id: string;
  content: string;
  options: string[];
  timeLimit: number;
}

interface BattleQuestion {
  question: Question;
  totalQuestions: number;
  currentQuestionNumber: number;
}

interface BattleScore {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeBonus: number;
}

interface BattleInterfaceProps {
  battleId: string;
  onComplete?: (score: BattleScore) => void;
}

export const BattleInterface: React.FC<BattleInterfaceProps> = ({
  battleId,
  onComplete,
}) => {
  const { toast } = useToast();
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [score, setScore] = useState<BattleScore>({
    score: 0,
    correctAnswers: 0,
    totalQuestions: 0,
    timeBonus: 0,
  });

  // Fetch current question
  const [fetchQuestion, questionState] = useAxiosGet<BattleQuestion>(
    `/api/battles/${battleId}/current-question`,
  );

  // Submit answer
  const [submitAnswer, submitState] = useAxiosPost<
    { success: boolean; isCorrect: boolean; score: number },
    { answerId: string; timeSpent: number }
  >(`/api/battles/${battleId}/submit-answer`);

  // Timer effect
  useEffect(() => {
    if (questionState.data?.question.timeLimit && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - 1));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLeft, questionState.data]);

  // Load question effect
  useEffect(() => {
    const loadQuestion = async () => {
      try {
        const response = await fetchQuestion();
        if (response.data) {
          setTimeLeft(response.data.question.timeLimit);
          setSelectedAnswer(null);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to load question. Please try again.';
        toast({
          variant: 'destructive',
          title: 'Error',
          description: errorMessage,
        });
      }
    };

    loadQuestion();
  }, [fetchQuestion, toast]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeLeft === 0 && selectedAnswer) {
      handleSubmit();
    }
  }, [timeLeft]);

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleSubmit = async () => {
    if (!selectedAnswer) return;

    try {
      const timeSpent = questionState.data!.question.timeLimit - timeLeft;
      const response = await submitAnswer({
        answerId: selectedAnswer,
        timeSpent,
      });

      if (response.data.success) {
        // Update score
        setScore((prev) => ({
          ...prev,
          score: response.data.score,
          correctAnswers:
            prev.correctAnswers + (response.data.isCorrect ? 1 : 0),
          totalQuestions: prev.totalQuestions + 1,
          timeBonus:
            prev.timeBonus +
            Math.floor(
              (timeLeft / questionState.data!.question.timeLimit) * 10,
            ),
        }));

        // Load next question or complete battle
        if (
          questionState.data!.currentQuestionNumber ===
          questionState.data!.totalQuestions
        ) {
          onComplete?.(score);
        } else {
          await fetchQuestion();
        }
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to submit answer. Please try again.';
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
    }
  };

  if (questionState.isLoading || !questionState.data) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const { question, currentQuestionNumber, totalQuestions } =
    questionState.data;

  return (
    <div className="space-y-6">
      {/* Progress and Score */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium">
            Question {currentQuestionNumber} of {totalQuestions}
          </p>
          <Progress
            value={(currentQuestionNumber / totalQuestions) * 100}
            className="w-[200px]"
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span className="text-lg font-bold">{score.score}</span>
          </div>
          <div className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-blue-500" />
            <span className="text-lg font-medium">{timeLeft}s</span>
          </div>
        </div>
      </div>

      {/* Question */}
      <Card>
        <CardHeader>
          <CardTitle>{question.content}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {question.options.map((option, index) => (
            <Button
              key={index}
              variant={selectedAnswer === option ? 'default' : 'outline'}
              className={cn(
                'justify-start px-4 py-6 text-left',
                selectedAnswer === option && 'ring-2 ring-primary',
              )}
              onClick={() => handleAnswerSelect(option)}
              disabled={timeLeft === 0 || submitState.isLoading}
            >
              <span className="mr-2">{String.fromCharCode(65 + index)}.</span>
              {option}
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={!selectedAnswer || timeLeft === 0 || submitState.isLoading}
          className="min-w-[120px]"
        >
          {submitState.isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Answer'
          )}
        </Button>
      </div>
    </div>
  );
};
