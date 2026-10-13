import { CheckCircle2, Play, RotateCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { LANGUAGE_OPTIONS } from './challengeTypes';
import type { ChallengeRunner } from './useChallengeRunner';

export function ChallengeToolbar({
  difficulty,
  language,
  onLanguageChange,
  onReset,
  runner,
}: {
  difficulty: string;
  language: string;
  onLanguageChange: (language: string) => void;
  onReset: () => void;
  runner: ChallengeRunner;
}) {
  const { isRunning, isSubmitting, isReviewing } = runner;
  return (
    // Wraps on narrow viewports — the controls total ~500px, which overflowed
    // a 390px screen and left the whole page scrolling sideways (ED-7).
    <div className="flex flex-wrap items-center justify-between gap-y-2 border-b border-border bg-card px-4 py-2">
      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
        <Badge variant="outline" className="px-3 py-1 text-xs">
          {difficulty}
        </Badge>
        <div className="flex items-center gap-2">
          <Select value={language} onValueChange={onLanguageChange}>
            <SelectTrigger
              aria-label="Programming language"
              className="h-9 w-[120px] border-none bg-accent/50 hover:bg-accent sm:w-[140px]"
            >
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="icon"
            onClick={onReset}
            title="Reset Code"
            aria-label="Reset code to the starting template"
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <Button
          variant="secondary"
          className="h-9 gap-2 px-4 font-semibold"
          onClick={runner.handleRunCode}
          disabled={isRunning}
        >
          <Play className={cn('h-4 w-4', isRunning && 'animate-pulse')} />
          {isRunning ? 'Running...' : 'Run Code'}
        </Button>
        <Button
          variant="default"
          className="hover:bg-primary/90 h-9 gap-2 bg-primary px-6 font-semibold text-white"
          onClick={runner.handleSubmit}
          disabled={isRunning || isSubmitting || isReviewing}
        >
          <CheckCircle2
            className={cn('h-4 w-4', isSubmitting && 'animate-pulse')}
          />
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
      </div>
    </div>
  );
}

export function ChallengeStatusBar({ language }: { language: string }) {
  return (
    <div className="flex h-8 items-center justify-between border-t border-border bg-card px-4 text-[10px] text-muted-foreground">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <div className="bg-green-500 h-2 w-2 rounded-full" />
          Connected
        </div>
        <div>Ln 1, Col 1</div>
      </div>
      <div className="flex items-center gap-4">
        <div>UTF-8</div>
        <div className="flex items-center gap-1 uppercase">{language}</div>
      </div>
    </div>
  );
}
