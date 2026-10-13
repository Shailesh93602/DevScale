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

export interface NamedOption {
  id: string;
  title?: string;
  name?: string;
}
export interface RoadmapOption {
  id: string;
  title: string;
  slug?: string | null;
}
export interface SubjectOption {
  id: string;
  title?: string;
  name?: string;
  order?: number;
}
export interface TopicLink {
  topic?: NamedOption;
}
export interface CategoryOption {
  category: string;
  count: number;
  difficulties: string[];
}

export type SourceMode = 'curriculum' | 'dsa';

/** Accepts both a bare array and the `{ data: [...] }` envelope the API returns. */
export function unwrapList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  return (data as { data?: T[] } | null)?.data ?? [];
}

/** Retries the roadmap list so one slow response cannot leave the dropdown on "Loading..." forever. */
export async function fetchRoadmapsWithRetry(
  fetcher: () => Promise<{ data: unknown }>,
  onLoaded: (list: RoadmapOption[]) => void,
  isCancelled: () => boolean,
  attempt = 0,
): Promise<void> {
  try {
    const res = await fetcher();
    const list = unwrapList<RoadmapOption>(res.data);
    if (!isCancelled()) onLoaded(list);
  } catch {
    if (!isCancelled() && attempt < 3) {
      setTimeout(
        () => {
          void fetchRoadmapsWithRetry(
            fetcher,
            onLoaded,
            isCancelled,
            attempt + 1,
          );
        },
        1000 * (attempt + 1),
      );
    }
  }
}

export interface SourceSelection {
  mode: SourceMode;
  roadmaps: RoadmapOption[];
  mainConcepts: NamedOption[];
  subjects: SubjectOption[];
  topics: NamedOption[];
  selectedRoadmap: string;
  selectedMainConcept: string;
  selectedSubject: string;
  selectedTopic: string;
  selectedCategories: string[];
}

export type ActiveSource = Pick<QuestionSource, 'type' | 'id' | 'label'>;

const optionLabel = (
  options: { id: string; title?: string; name?: string }[],
  id: string,
) => {
  const found = options.find((x) => x.id === id);
  return found?.title ?? found?.name ?? id;
};

export function formatDsaLabel(categories: string[]): string {
  const shown = categories
    .slice(0, 2)
    .map((c) => c.replace(/_/g, ' '))
    .join(', ');
  const more = categories.length > 2 ? ` +${categories.length - 2}` : '';
  return `DSA: ${shown}${more}`;
}

/** The most specific selected level wins: topic, then subject, concept, roadmap. */
export function resolveActiveSource(s: SourceSelection): ActiveSource | null {
  if (s.mode === 'curriculum') {
    if (s.selectedTopic) {
      return {
        type: 'topic',
        id: s.selectedTopic,
        label: optionLabel(s.topics, s.selectedTopic),
      };
    }
    if (s.selectedSubject) {
      return {
        type: 'subject',
        id: s.selectedSubject,
        label: optionLabel(s.subjects, s.selectedSubject),
      };
    }
    if (s.selectedMainConcept) {
      return {
        type: 'main_concept',
        id: s.selectedMainConcept,
        label: optionLabel(s.mainConcepts, s.selectedMainConcept),
      };
    }
    if (s.selectedRoadmap) {
      return {
        type: 'roadmap',
        id: s.selectedRoadmap,
        label: optionLabel(s.roadmaps, s.selectedRoadmap),
      };
    }
  } else if (s.mode === 'dsa' && s.selectedCategories.length > 0) {
    return {
      type: 'dsa',
      id: s.selectedCategories.join(','),
      label: formatDsaLabel(s.selectedCategories),
    };
  }
  return null;
}
