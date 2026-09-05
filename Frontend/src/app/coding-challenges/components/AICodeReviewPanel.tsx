'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertTriangle, XCircle, Lightbulb } from 'lucide-react';
import type { AiCodeReview } from '@/hooks/useCodeReview';

function formatVerdict(verdict: string): string {
  const text = verdict.replace(/_/g, ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function verdictStyle(verdict: string): {
  color: string;
  Icon: typeof CheckCircle2;
} {
  switch (verdict) {
    // Theme tokens (flip per theme in globals.css) rather than palette shades
    // with a dark-mode variant — tests/regression-ui-contract.spec.ts forbids the
    // latter. `text-success`, not `text-green`: the light `--color-green` is
    // 3.33:1 on white, below AA for body text; `--success` is 6.20:1.
    case 'correct':
      return { color: 'text-success', Icon: CheckCircle2 };
    case 'incorrect':
      return { color: 'text-red', Icon: XCircle };
    default: // partially_correct | uncertain
      return { color: 'text-warning', Icon: AlertTriangle };
  }
}

function scoreColor(score: number): string {
  if (score >= 80) return 'bg-green-600';
  if (score >= 50) return 'bg-amber-500';
  return 'bg-red-600';
}

export function AICodeReviewPanel({ review }: { review: AiCodeReview }) {
  const {
    summary,
    correctness,
    complexity,
    edgeCasesMissed,
    improvements,
    score,
  } = review;
  const { color, Icon } = verdictStyle(correctness.verdict);

  return (
    <div className="space-y-4 p-4" data-testid="ai-code-review">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
          <div>
            <CardTitle className="text-base">AI Code Review</CardTitle>
            <CardDescription>{summary}</CardDescription>
          </div>
          <span
            data-testid="review-score"
            className={cn(
              'shrink-0 rounded-full px-3 py-1 text-sm font-semibold text-white',
              scoreColor(score),
            )}
          >
            {score}/100
          </span>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="flex items-start gap-3 p-4">
          <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', color)} />
          <div>
            <p
              className={cn('font-semibold', color)}
              data-testid="review-verdict"
            >
              {formatVerdict(correctness.verdict)}
            </p>
            <p className="text-sm text-muted-foreground">
              {correctness.explanation}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid grid-cols-2 gap-4 p-4 font-mono text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Time complexity</p>
            <p className="font-semibold" data-testid="review-time-complexity">
              {complexity.time}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Space complexity</p>
            <p className="font-semibold" data-testid="review-space-complexity">
              {complexity.space}
            </p>
          </div>
        </CardContent>
      </Card>

      {improvements.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Lightbulb className="h-4 w-4 text-primary" />
              Suggested improvements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4 pt-0">
            {improvements.map((imp, idx) => (
              <div
                key={`${imp.title}-${idx}`}
                className="border-l-2 border-primary pl-3"
              >
                <p className="text-sm font-semibold">{imp.title}</p>
                <p className="text-xs text-muted-foreground">{imp.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {edgeCasesMissed.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Edge cases missed</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <ul className="space-y-1 text-sm text-muted-foreground">
              {edgeCasesMissed.map((edgeCase, idx) => (
                <li key={`${edgeCase}-${idx}`} className="flex gap-2">
                  <span>•</span>
                  <span>{edgeCase}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
