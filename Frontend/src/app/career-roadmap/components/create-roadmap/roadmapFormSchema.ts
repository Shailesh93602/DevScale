import * as z from 'zod';

export interface RoadmapCategoryOption {
  id: string;
  name: string;
}

export interface MainConcept {
  id: string;
  name: string;
}

export interface Subject {
  id: string;
  name: string;
  title?: string;
}

export interface Topic {
  id: string;
  name: string;
}

export const formSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must not exceed 100 characters'),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(500, 'Description must not exceed 500 characters'),
  categoryId: z.string().min(1, 'Please select a category'),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  estimatedHours: z.number().min(1, 'Estimated hours must be at least 1'),
  isPublic: z.boolean().default(false),
  version: z.string().default('1.0'),
  tags: z.array(z.string()).default([]),
  mainConcepts: z
    .array(
      z.object({
        main_concept_id: z.string(),
        order: z.number(),
        subjects: z.array(
          z.object({
            subject_id: z.string(),
            order: z.number(),
            topics: z.array(
              z.object({
                topic_id: z.string(),
                order: z.number(),
              }),
            ),
          }),
        ),
      }),
    )
    .min(1, 'At least one main concept is required'),
});

export type RoadmapFormData = z.infer<typeof formSchema>;

export const ROADMAP_FORM_DEFAULTS: RoadmapFormData = {
  title: '',
  description: '',
  categoryId: '',
  difficulty: 'BEGINNER',
  estimatedHours: 1,
  isPublic: false,
  version: '1.0',
  tags: [],
  mainConcepts: [],
};

export interface ConceptOptions {
  mainConcepts: MainConcept[];
  subjects: Subject[];
  topics: Topic[];
}
