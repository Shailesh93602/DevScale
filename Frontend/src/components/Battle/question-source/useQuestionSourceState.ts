import { useEffect, useRef, useState } from 'react';
import { useAxiosGet } from '@/hooks/useAxios';
import {
  CategoryOption,
  NamedOption,
  QuestionSource,
  RoadmapOption,
  SourceMode,
  SubjectOption,
  TopicLink,
  fetchRoadmapsWithRetry,
  resolveActiveSource,
  unwrapList,
} from './questionSource';

/** Roadmap → main concept → subject → topic cascade; each level resets the ones below it. */
function useCurriculumCascade() {
  const [roadmaps, setRoadmaps] = useState<RoadmapOption[]>([]);
  const [mainConcepts, setMainConcepts] = useState<NamedOption[]>([]);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [topics, setTopics] = useState<NamedOption[]>([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState('');
  const [selectedMainConcept, setSelectedMainConcept] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');

  const [getRoadmaps] = useAxiosGet<RoadmapOption[]>('/roadmaps');
  const [getMainConceptsForRoadmap] = useAxiosGet<NamedOption[]>(
    '/roadmaps/{{id}}/main-concepts',
  );
  const [getSubjectsForConcept] = useAxiosGet<SubjectOption[]>(
    '/main-concepts/{{id}}/subjects',
  );
  const [getTopicsForSubject] = useAxiosGet<{ topics?: TopicLink[] }>(
    '/subjects/{{id}}/topics',
  );

  return {
    roadmaps,
    mainConcepts,
    subjects,
    topics,
    selectedRoadmap,
    setSelectedRoadmap,
    selectedMainConcept,
    setSelectedMainConcept,
    selectedSubject,
    setSelectedSubject,
    selectedTopic,
    setSelectedTopic,
    /** Effects are registered by the caller so their order matches the original component. */
    loadRoadmaps: () => {
      let cancelled = false;
      void fetchRoadmapsWithRetry(
        () => getRoadmaps({ params: { limit: 100 } }),
        setRoadmaps,
        () => cancelled,
      );
      return () => {
        cancelled = true;
      };
    },
    onRoadmapChange: () => {
      setMainConcepts([]);
      setSelectedMainConcept('');
      setSubjects([]);
      setSelectedSubject('');
      setTopics([]);
      setSelectedTopic('');
      if (!selectedRoadmap) return;
      getMainConceptsForRoadmap({}, { id: selectedRoadmap })
        .then((res) => setMainConcepts(unwrapList<NamedOption>(res.data)))
        .catch(() => {});
    },
    onMainConceptChange: () => {
      setSubjects([]);
      setSelectedSubject('');
      setTopics([]);
      setSelectedTopic('');
      if (!selectedMainConcept) return;
      getSubjectsForConcept({}, { id: selectedMainConcept })
        .then((res) => setSubjects(unwrapList<SubjectOption>(res.data)))
        .catch(() => {});
    },
    onSubjectChange: () => {
      setTopics([]);
      setSelectedTopic('');
      if (!selectedSubject) return;
      getTopicsForSubject({}, { id: selectedSubject })
        .then((res) => {
          const raw = res.data?.topics ?? [];
          setTopics(
            raw
              .map((e) => e.topic)
              .filter((t): t is NamedOption => Boolean(t?.id)),
          );
        })
        .catch(() => {});
    },
  };
}

interface Options {
  onChange: (source: QuestionSource | null) => void;
  parentDifficulty?: string;
  defaultCount: number;
}

/** All selection state and pool checks behind QuestionSourceSelector. */
export function useQuestionSourceState({
  onChange,
  parentDifficulty,
  defaultCount,
}: Options) {
  const [mode, setMode] = useState<SourceMode>('curriculum');
  const c = useCurriculumCascade();

  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [dsaDifficulty, setDsaDifficulty] = useState('');

  const [totalAvailable, setTotalAvailable] = useState<number | null>(null);
  const [poolLoading, setPoolLoading] = useState(false);
  const [count, setCount] = useState(defaultCount);

  const [getCategories] = useAxiosGet<CategoryOption[]>(
    '/challenges/categories',
  );
  const [getPool] = useAxiosGet<{
    questions: unknown[];
    total_available: number;
  }>('/battles/question-pool');

  const poolTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => c.loadRoadmaps(), []);

  // Load categories when DSA mode activated
  useEffect(() => {
    if (mode !== 'dsa' || categories.length > 0) return;
    getCategories()
      .then((res) => setCategories(unwrapList<CategoryOption>(res.data)))
      .catch(() => {});
  }, [mode]);

  useEffect(() => c.onRoadmapChange(), [c.selectedRoadmap]);
  useEffect(() => c.onMainConceptChange(), [c.selectedMainConcept]);
  useEffect(() => c.onSubjectChange(), [c.selectedSubject]);

  // Fetch pool count whenever source or count changes (debounced)
  useEffect(() => {
    const src = resolveActiveSource({ mode, selectedCategories, ...c });
    if (!src) {
      setTotalAvailable(null);
      onChange(null);
      return;
    }

    if (poolTimer.current) clearTimeout(poolTimer.current);
    setPoolLoading(true);

    poolTimer.current = setTimeout(() => {
      const effectiveDifficulty = dsaDifficulty || parentDifficulty;
      const params: Record<string, string | number> = {
        type: src.type,
        id: src.id,
        count,
      };
      if (effectiveDifficulty) params.difficulty = effectiveDifficulty;
      if (mode === 'dsa' && selectedCategories.length > 0) {
        params.categories = selectedCategories.join(',');
      }

      getPool({ params, timeout: 25000 })
        .then((res) => {
          setTotalAvailable(res.data?.total_available ?? 0);
          onChange({
            ...src,
            count,
            difficulty: effectiveDifficulty ?? undefined,
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
  }, [
    c.selectedRoadmap,
    c.selectedMainConcept,
    c.selectedSubject,
    c.selectedTopic,
    selectedCategories,
    dsaDifficulty,
    parentDifficulty,
    count,
    mode,
  ]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((x) => x !== cat) : [...prev, cat],
    );
  };

  const switchMode = (next: SourceMode) => {
    setMode(next);
    c.setSelectedRoadmap('');
    c.setSelectedMainConcept('');
    c.setSelectedSubject('');
    c.setSelectedTopic('');
    setSelectedCategories([]);
    onChange(null);
  };

  return {
    ...c,
    mode,
    switchMode,
    categories,
    selectedCategories,
    toggleCategory,
    dsaDifficulty,
    setDsaDifficulty,
    totalAvailable,
    poolLoading,
    count,
    setCount,
  };
}

export type QuestionSourceState = ReturnType<typeof useQuestionSourceState>;
