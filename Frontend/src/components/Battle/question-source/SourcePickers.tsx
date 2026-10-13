import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { QuestionSourceState } from './useQuestionSourceState';

const DSA_DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD'];

function OptionalHint({ children }: { children: ReactNode }) {
  return <span className="text-xs text-muted-foreground">{children}</span>;
}

/** One level of the curriculum cascade; shows "Loading..." until its options arrive. */
function LevelSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: ReactNode;
  value: string;
  onChange: (value: string) => void;
  options: { id: string; label: ReactNode }[];
  placeholder: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue
            placeholder={options.length === 0 ? 'Loading...' : placeholder}
          />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.id} value={o.id}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function CurriculumPicker({ s }: { s: QuestionSourceState }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Pick any level — questions come from all quizzes within. Narrower
        selection = more focused battle.
      </p>

      <LevelSelect
        label="Roadmap"
        value={s.selectedRoadmap}
        onChange={s.setSelectedRoadmap}
        options={s.roadmaps.map((r) => ({ id: r.id, label: r.title }))}
        placeholder="Select a roadmap"
      />

      {s.selectedRoadmap && (
        <LevelSelect
          label={
            <>
              Main Concept <OptionalHint>(optional)</OptionalHint>
            </>
          }
          value={s.selectedMainConcept}
          onChange={s.setSelectedMainConcept}
          options={s.mainConcepts.map((mc) => ({
            id: mc.id,
            label: mc.title ?? mc.name,
          }))}
          placeholder="Narrow to a concept"
        />
      )}

      {s.selectedMainConcept && (
        <LevelSelect
          label={
            <>
              Subject <OptionalHint>(optional)</OptionalHint>
            </>
          }
          value={s.selectedSubject}
          onChange={s.setSelectedSubject}
          options={s.subjects.map((sub) => ({
            id: sub.id,
            label: sub.title ?? sub.name,
          }))}
          placeholder="Narrow to a subject"
        />
      )}

      {s.selectedSubject && (
        <LevelSelect
          label={
            <>
              Topic <OptionalHint>(optional — most focused)</OptionalHint>
            </>
          }
          value={s.selectedTopic}
          onChange={s.setSelectedTopic}
          options={s.topics.map((t) => ({
            id: t.id,
            label: t.title ?? t.name,
          }))}
          placeholder="Narrow to a topic"
        />
      )}
    </div>
  );
}

export function DsaPicker({ s }: { s: QuestionSourceState }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Select DSA categories. Questions come from challenges matching your
        selection.
      </p>

      <div className="flex flex-wrap gap-2">
        {DSA_DIFFICULTIES.map((d) => (
          <Badge
            key={d}
            variant={s.dsaDifficulty === d ? 'default' : 'outline'}
            className="cursor-pointer capitalize"
            onClick={() => s.setDsaDifficulty((prev) => (prev === d ? '' : d))}
          >
            {d.charAt(0) + d.slice(1).toLowerCase()}
          </Badge>
        ))}
      </div>

      {s.categories.length === 0 ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading categories...
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {s.categories.map((cat) => {
            const selected = s.selectedCategories.includes(cat.category);
            return (
              <Badge
                key={cat.category}
                variant={selected ? 'default' : 'outline'}
                className={cn(
                  'cursor-pointer capitalize',
                  selected && 'bg-primary text-primary-foreground',
                )}
                onClick={() => s.toggleCategory(cat.category)}
              >
                {cat.category.replace(/_/g, ' ')}{' '}
                <span className="ml-1 opacity-60">({cat.count})</span>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
