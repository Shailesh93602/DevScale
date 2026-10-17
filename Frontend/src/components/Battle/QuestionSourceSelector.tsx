'use client';

import { BookOpen, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { QuestionSource } from './question-source/questionSource';
import { useQuestionSourceState } from './question-source/useQuestionSourceState';
import { CurriculumPicker, DsaPicker } from './question-source/SourcePickers';
import { PoolCountSlider } from './question-source/PoolCountSlider';

export type {
  QuestionSource,
  QuestionSourceType,
} from './question-source/questionSource';

interface QuestionSourceSelectorProps {
  value: QuestionSource | null;
  onChange: (source: QuestionSource | null) => void;
  difficulty?: string;
  defaultCount?: number;
  maxCount?: number;
}

export default function QuestionSourceSelector({
  value,
  onChange,
  difficulty: parentDifficulty,
  defaultCount = 10,
  maxCount = 30,
}: QuestionSourceSelectorProps) {
  const s = useQuestionSourceState({
    onChange,
    parentDifficulty,
    defaultCount,
  });

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        <Button
          type="button"
          variant={s.mode === 'curriculum' ? 'default' : 'outline'}
          size="sm"
          onClick={() => s.switchMode('curriculum')}
          className="flex items-center gap-2"
        >
          <BookOpen className="h-4 w-4" />
          Curriculum
        </Button>
        <Button
          type="button"
          variant={s.mode === 'dsa' ? 'default' : 'outline'}
          size="sm"
          onClick={() => s.switchMode('dsa')}
          className="flex items-center gap-2"
        >
          <Code2 className="h-4 w-4" />
          DSA Challenges
        </Button>
      </div>

      {s.mode === 'curriculum' ? (
        <CurriculumPicker s={s} />
      ) : (
        <DsaPicker s={s} />
      )}

      <PoolCountSlider
        count={s.count}
        setCount={s.setCount}
        maxCount={maxCount}
        poolLoading={s.poolLoading}
        poolError={s.poolError}
        totalAvailable={s.totalAvailable}
      />

      {value && (
        <div className="rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm">
          <span className="font-medium text-primary">Source: </span>
          <span className="text-foreground">{value.label}</span>
          <span className="ml-2 text-xs capitalize text-muted-foreground">
            ({value.type.replace(/_/g, ' ')})
          </span>
        </div>
      )}
    </div>
  );
}
