'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, HelpCircle, CheckCircle2 } from 'lucide-react';
import { useAxiosGet } from '@/hooks/useAxios';
import { cn } from '@/lib/utils';
import type { QuestionSource } from './QuestionSourceSelector';

interface PreviewQuestion {
  source_quiz_question_id: string | null;
  source_challenge_id: string | null;
  question: string;
  options: string[];
  explanation: string | null;
  points: number;
  time_limit: number;
}

interface QuestionPreviewListProps {
  source: QuestionSource;
  difficulty?: string;
  className?: string;
}

export default function QuestionPreviewList({
  source,
  difficulty,
  className,
}: QuestionPreviewListProps) {
  const [questions, setQuestions] = useState<PreviewQuestion[]>([]);
  const [totalAvailable, setTotalAvailable] = useState(0);
  const [loading, setLoading] = useState(false);
  const [rollCount, setRollCount] = useState(0);

  const [getPool] = useAxiosGet<{ questions: PreviewQuestion[]; total_available: number }>(
    '/battles/question-pool',
  );

  const fetchPreview = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        type: source.type,
        id: source.id,
        count: source.count,
      };
      const effectiveDifficulty = source.difficulty ?? difficulty;
      if (effectiveDifficulty) params.difficulty = effectiveDifficulty;
      if (source.categories?.length) params.categories = source.categories.join(',');

      const res = await getPool({ params, timeout: 25000 });
      if (res.success && res.data) {
        setQuestions(res.data.questions ?? []);
        setTotalAvailable(res.data.total_available ?? 0);
      }
    } catch {
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source.type, source.id, source.count, source.difficulty, source.categories, difficulty, rollCount]);

  useEffect(() => {
    fetchPreview();
  }, [fetchPreview]);

  const handleReroll = () => setRollCount((n) => n + 1);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">
            {questions.length} of {totalAvailable} questions sampled
          </p>
          <p className="text-xs text-muted-foreground">
            Correct answers are hidden until participants submit
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleReroll}
          disabled={loading}
          className="flex items-center gap-2"
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
          Re-roll
        </Button>
      </div>

      {/* Question list */}
      {loading ? (
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Sampling questions...
        </div>
      ) : questions.length === 0 ? (
        <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
          <HelpCircle className="mx-auto mb-2 h-6 w-6 opacity-50" />
          No questions found for this source. Try a broader selection.
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q, idx) => (
            <div
              key={q.source_quiz_question_id ?? idx}
              className="rounded-md border bg-card p-3 text-sm"
            >
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="mt-0.5 shrink-0 text-xs">
                  Q{idx + 1}
                </Badge>
                <p className="font-medium leading-snug text-foreground">{q.question}</p>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-1 pl-8">
                {q.options.map((opt, optIdx) => (
                  <div
                    key={optIdx}
                    className="flex items-center gap-1.5 rounded bg-muted/50 px-2 py-1 text-xs text-muted-foreground"
                  >
                    <span className="font-medium text-foreground/70">
                      {String.fromCharCode(65 + optIdx)}.
                    </span>
                    {opt}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer summary */}
      {questions.length > 0 && (
        <div className="flex items-center gap-2 rounded-md bg-primary/5 px-3 py-2 text-sm text-primary">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>
            {questions.length} questions ready · {source.label} · answers hidden from participants
          </span>
        </div>
      )}
    </div>
  );
}
