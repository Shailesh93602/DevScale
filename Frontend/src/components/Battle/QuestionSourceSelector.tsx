'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Loader2, BookOpen, Code2 } from 'lucide-react';
import { useAxiosGet } from '@/hooks/useAxios';
import { cn } from '@/lib/utils';

// ── Types ──────────────────────────────────────────────────────────────────

export type QuestionSourceType =
  | 'topic'
  | 'subject'
  | 'main_concept'
  | 'roadmap'
  | 'dsa';

export interface QuestionSource {
  type: QuestionSourceType;
  id: string;
  label: string;
  count: number;
  difficulty?: string;
  categories?: string[];
}

interface QuestionSourceSelectorProps {
  value: QuestionSource | null;
  onChange: (source: QuestionSource | null) => void;
  difficulty?: string;
  defaultCount?: number;
  maxCount?: number;
}

interface NamedOption {
  id: string;
  title?: string;
  name?: string;
}
interface RoadmapOption {
  id: string;
  title: string;
  slug?: string | null;
}
interface SubjectOption {
  id: string;
  title?: string;
  name?: string;
  order?: number;
}
interface TopicLink {
  topic?: NamedOption;
}
interface CategoryOption {
  category: string;
  count: number;
  difficulties: string[];
}

// ── Component ──────────────────────────────────────────────────────────────

export default function QuestionSourceSelector({
  value,
  onChange,
  difficulty: parentDifficulty,
  defaultCount = 10,
  maxCount = 30,
}: QuestionSourceSelectorProps) {
  const [mode, setMode] = useState<'curriculum' | 'dsa'>('curriculum');

  // Curriculum state
  const [roadmaps, setRoadmaps] = useState<RoadmapOption[]>([]);
  const [mainConcepts, setMainConcepts] = useState<NamedOption[]>([]);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [topics, setTopics] = useState<NamedOption[]>([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState('');
  const [selectedMainConcept, setSelectedMainConcept] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');

  // DSA state
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [dsaDifficulty, setDsaDifficulty] = useState('');

  // Pool availability
  const [totalAvailable, setTotalAvailable] = useState<number | null>(null);
  const [poolLoading, setPoolLoading] = useState(false);

  const [count, setCount] = useState(defaultCount);

  // All hooks declared at top level
  const [getRoadmaps] = useAxiosGet<RoadmapOption[]>('/roadmaps');
  const [getMainConceptsForRoadmap] = useAxiosGet<NamedOption[]>(
    '/roadmaps/{{id}}/main_concepts',
  );
  const [getSubjectsForConcept] = useAxiosGet<SubjectOption[]>(
    '/main-concepts/{{id}}/subjects',
  );
  const [getTopicsForSubject] = useAxiosGet<{ topics?: TopicLink[] }>(
    '/subjects/{{id}}/topics',
  );
  const [getCategories] = useAxiosGet<CategoryOption[]>(
    '/challenges/categories',
  );
  const [getPool] = useAxiosGet<{
    questions: unknown[];
    total_available: number;
  }>('/battles/question-pool');

  // Debounce timer for pool fetching
  const poolTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load roadmaps on mount
  useEffect(() => {
    getRoadmaps({ params: { limit: 100 } })
      .then((res) => {
        const list: RoadmapOption[] = Array.isArray(res.data)
          ? (res.data as unknown as RoadmapOption[])
          : ((res.data as unknown as { data?: RoadmapOption[] })?.data ?? []);
        setRoadmaps(list);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load categories when DSA mode activated
  useEffect(() => {
    if (mode !== 'dsa' || categories.length > 0) return;
    getCategories()
      .then((res) => {
        const list: CategoryOption[] = Array.isArray(res.data)
          ? (res.data as unknown as CategoryOption[])
          : ((res.data as unknown as { data?: CategoryOption[] })?.data ?? []);
        setCategories(list);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // Load main concepts when roadmap changes
  useEffect(() => {
    setMainConcepts([]);
    setSelectedMainConcept('');
    setSubjects([]);
    setSelectedSubject('');
    setTopics([]);
    setSelectedTopic('');
    if (!selectedRoadmap) return;

    getMainConceptsForRoadmap({}, { id: selectedRoadmap })
      .then((res) => {
        const list: NamedOption[] = Array.isArray(res.data)
          ? (res.data as unknown as NamedOption[])
          : ((res.data as unknown as { data?: NamedOption[] })?.data ?? []);
        setMainConcepts(list);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoadmap]);

  // Load subjects when main concept changes
  useEffect(() => {
    setSubjects([]);
    setSelectedSubject('');
    setTopics([]);
    setSelectedTopic('');
    if (!selectedMainConcept) return;

    getSubjectsForConcept({}, { id: selectedMainConcept })
      .then((res) => {
        const list: SubjectOption[] = Array.isArray(res.data)
          ? (res.data as unknown as SubjectOption[])
          : ((res.data as unknown as { data?: SubjectOption[] })?.data ?? []);
        setSubjects(list);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMainConcept]);

  // Load topics when subject changes
  useEffect(() => {
    setTopics([]);
    setSelectedTopic('');
    if (!selectedSubject) return;

    getTopicsForSubject({}, { id: selectedSubject })
      .then((res) => {
        const raw = res.data?.topics ?? [];
        const normalized = raw
          .map((e) => e.topic)
          .filter((t): t is NamedOption => Boolean(t?.id));
        setTopics(normalized);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubject]);

  // Determine active source
  const getActiveSource = (): {
    type: QuestionSourceType;
    id: string;
    label: string;
  } | null => {
    if (mode === 'curriculum') {
      if (selectedTopic) {
        const t = topics.find((x) => x.id === selectedTopic);
        return {
          type: 'topic',
          id: selectedTopic,
          label: t?.title ?? t?.name ?? selectedTopic,
        };
      }
      if (selectedSubject) {
        const s = subjects.find((x) => x.id === selectedSubject);
        return {
          type: 'subject',
          id: selectedSubject,
          label: s?.title ?? s?.name ?? selectedSubject,
        };
      }
      if (selectedMainConcept) {
        const mc = mainConcepts.find((x) => x.id === selectedMainConcept);
        return {
          type: 'main_concept',
          id: selectedMainConcept,
          label: mc?.title ?? mc?.name ?? selectedMainConcept,
        };
      }
      if (selectedRoadmap) {
        const r = roadmaps.find((x) => x.id === selectedRoadmap);
        return {
          type: 'roadmap',
          id: selectedRoadmap,
          label: r?.title ?? selectedRoadmap,
        };
      }
    } else if (mode === 'dsa' && selectedCategories.length > 0) {
      const label = `DSA: ${selectedCategories
        .slice(0, 2)
        .map((c) => c.replace(/_/g, ' '))
        .join(
          ', ',
        )}${selectedCategories.length > 2 ? ` +${selectedCategories.length - 2}` : ''}`;
      return { type: 'dsa', id: selectedCategories.join(','), label };
    }
    return null;
  };

  // Fetch pool count whenever source or count changes (debounced)
  useEffect(() => {
    const src = getActiveSource();
    if (!src) {
      setTotalAvailable(null);
      onChange(null);
      return;
    }

    if (poolTimer.current) clearTimeout(poolTimer.current);
    setPoolLoading(true);

    poolTimer.current = setTimeout(() => {
      const params: Record<string, string | number> = {
        type: src.type,
        id: src.id,
        count,
      };
      const effectiveDifficulty = dsaDifficulty || parentDifficulty;
      if (effectiveDifficulty) params.difficulty = effectiveDifficulty;
      if (mode === 'dsa' && selectedCategories.length > 0) {
        params.categories = selectedCategories.join(',');
      }

      getPool({ params, timeout: 25000 })
        .then((res) => {
          const total = res.data?.total_available ?? 0;
          setTotalAvailable(total);
          onChange({
            type: src.type,
            id: src.id,
            label: src.label,
            count,
            difficulty: (dsaDifficulty || parentDifficulty) ?? undefined,
            categories: mode === 'dsa' ? selectedCategories : undefined,
          });
        })
        .catch(() => {
          setTotalAvailable(null);
          onChange(null);
        })
        .finally(() => setPoolLoading(false));
    }, 500);

    return () => {
      if (poolTimer.current) clearTimeout(poolTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedRoadmap,
    selectedMainConcept,
    selectedSubject,
    selectedTopic,
    selectedCategories,
    dsaDifficulty,
    parentDifficulty,
    count,
    mode,
  ]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const switchMode = (next: 'curriculum' | 'dsa') => {
    setMode(next);
    setSelectedRoadmap('');
    setSelectedMainConcept('');
    setSelectedSubject('');
    setSelectedTopic('');
    setSelectedCategories([]);
    onChange(null);
  };

  return (
    <div className="space-y-5">
      {/* Mode toggle */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant={mode === 'curriculum' ? 'default' : 'outline'}
          size="sm"
          onClick={() => switchMode('curriculum')}
          className="flex items-center gap-2"
        >
          <BookOpen className="h-4 w-4" />
          Curriculum
        </Button>
        <Button
          type="button"
          variant={mode === 'dsa' ? 'default' : 'outline'}
          size="sm"
          onClick={() => switchMode('dsa')}
          className="flex items-center gap-2"
        >
          <Code2 className="h-4 w-4" />
          DSA Challenges
        </Button>
      </div>

      {mode === 'curriculum' ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Pick any level — questions come from all quizzes within. Narrower
            selection = more focused battle.
          </p>

          {/* Roadmap */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Roadmap</label>
            <Select value={selectedRoadmap} onValueChange={setSelectedRoadmap}>
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    roadmaps.length === 0 ? 'Loading...' : 'Select a roadmap'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {roadmaps.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Main Concept */}
          {selectedRoadmap && (
            <div className="space-y-1">
              <label className="text-sm font-medium">
                Main Concept{' '}
                <span className="text-xs text-muted-foreground">
                  (optional)
                </span>
              </label>
              <Select
                value={selectedMainConcept}
                onValueChange={setSelectedMainConcept}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      mainConcepts.length === 0
                        ? 'Loading...'
                        : 'Narrow to a concept'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {mainConcepts.map((mc) => (
                    <SelectItem key={mc.id} value={mc.id}>
                      {mc.title ?? mc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Subject */}
          {selectedMainConcept && (
            <div className="space-y-1">
              <label className="text-sm font-medium">
                Subject{' '}
                <span className="text-xs text-muted-foreground">
                  (optional)
                </span>
              </label>
              <Select
                value={selectedSubject}
                onValueChange={setSelectedSubject}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      subjects.length === 0
                        ? 'Loading...'
                        : 'Narrow to a subject'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.title ?? s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Topic */}
          {selectedSubject && (
            <div className="space-y-1">
              <label className="text-sm font-medium">
                Topic{' '}
                <span className="text-xs text-muted-foreground">
                  (optional — most focused)
                </span>
              </label>
              <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      topics.length === 0 ? 'Loading...' : 'Narrow to a topic'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {topics.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.title ?? t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Select DSA categories. Questions come from challenges matching your
            selection.
          </p>

          {/* DSA Difficulty filter */}
          <div className="flex flex-wrap gap-2">
            {['EASY', 'MEDIUM', 'HARD'].map((d) => (
              <Badge
                key={d}
                variant={dsaDifficulty === d ? 'default' : 'outline'}
                className="cursor-pointer capitalize"
                onClick={() =>
                  setDsaDifficulty((prev) => (prev === d ? '' : d))
                }
              >
                {d.charAt(0) + d.slice(1).toLowerCase()}
              </Badge>
            ))}
          </div>

          {/* Category chips */}
          {categories.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading categories...
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Badge
                  key={cat.category}
                  variant={
                    selectedCategories.includes(cat.category)
                      ? 'default'
                      : 'outline'
                  }
                  className={cn(
                    'cursor-pointer capitalize',
                    selectedCategories.includes(cat.category) &&
                      'bg-primary text-primary-foreground',
                  )}
                  onClick={() => toggleCategory(cat.category)}
                >
                  {cat.category.replace(/_/g, ' ')}{' '}
                  <span className="ml-1 opacity-60">({cat.count})</span>
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Question count slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Questions: {count}</label>
          {poolLoading ? (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" /> Checking pool...
            </span>
          ) : totalAvailable !== null ? (
            <span
              className={cn(
                'text-xs font-medium',
                totalAvailable >= count ? 'text-green-600' : 'text-amber-600',
              )}
            >
              {totalAvailable >= count
                ? `${totalAvailable} questions available`
                : `Only ${totalAvailable} available — lower count recommended`}
            </span>
          ) : null}
        </div>
        <Slider
          min={5}
          max={maxCount}
          step={5}
          value={[count]}
          onValueChange={([v]) => setCount(v)}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>5</span>
          <span>{maxCount}</span>
        </div>
      </div>

      {/* Active source badge */}
      {value && (
        <div className="border-primary/30 bg-primary/5 rounded-md border px-3 py-2 text-sm">
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
