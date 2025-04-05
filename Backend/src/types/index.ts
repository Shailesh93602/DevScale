import {
  ChallengeCategory,
  Difficulty,
  JobType,
  QuizType,
  Status,
} from '@prisma/client';

export interface ResourceStats {
  total: number;
  active: number;
  pending: number;
  reported: number;
}

export interface CategoryData {
  name: string;
  description?: string;
  parent_id?: string;
}

export interface CategoryTree {
  id: string;
  name: string;
  description?: string | null;
  parent_id?: string | null;
  children: CategoryTree[];
}

export interface RoadmapData {
  title: string;
  description: string;
  author_id: string;
  is_public?: boolean;
  concepts?: ConceptData[];
}

export interface ConceptData {
  title: string;
  description: string;
  order: number;
  subjects?: SubjectData[];
}

export interface SubjectData {
  title: string;
  description: string;
  order: number;
  topics?: TopicData[];
}

export interface TopicData {
  title: string;
  description: string;
  order: number;
  content?: string;
  resources?: string[];
  prerequisites?: string[];
}

export interface SubjectOrder {
  subject_id: string;
  order: number;
}

export interface UserRoadmapData {
  user_id: string;
  roadmap_id: string;
  topic_id: string;
  is_custom?: boolean;
  title?: string;
  description?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filter?: Record<string, any>;
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    currentPage: number;
    totalPages: number;
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface ArticleFilters {
  status?: Status;
  search?: string;
  author_id?: string;
}

export interface QuizData {
  title: string;
  description: string;
  type: QuizType;
  time_limit?: number;
  passing_score: number;
  questions: QuestionData[];
  topic_id?: string;
  subject_id?: string;
  main_concept_id?: string;
}

export interface QuestionData {
  question: string;
  type: 'multiple_choice' | 'coding';
  options?: string[];
  correct_answer: string;
  points: number;
  test_cases?: TestCase[];
}

export interface TestCase {
  input: string;
  expected_output: string;
  is_hidden?: boolean;
}

export interface SubmissionData {
  user_id: string;
  quiz_id: string;
  answers: Answer[];
  time_spent: number;
}

export interface Answer {
  question_id: string;
  answer: string;
}

export interface AuditLogParams {
  admin_id: string;
  action: string;
  entity: string;
  entity_id: string;
  details?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
}

export interface SecurityLogParams {
  type: string;
  severity: string;
  description: string;
  metadata?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  user_id?: string;
}

export interface ChangeHistoryParams {
  entity: string;
  entity_id: string;
  action: string;
  changes: Record<string, unknown>;
  user_id: string;
  reason?: string;
}

export interface ChallengeData {
  title: string;
  description: string;
  points: number;
  topic_id: string;
  difficulty: Difficulty;
  category: ChallengeCategory;
  input_format: string;
  output_format: string;
  example_input: string;
  example_output: string;
  constraints: string;
  function_signature: string;
  time_limit?: number;
  memory_limit?: number;
  tags: string[];
  test_cases: TestCase[];
  solutions?: Record<string, string>;
}

export interface TestCase {
  input: string;
  output: string;
  isHidden?: boolean;
}

export interface SubmissionData {
  code: string;
  language: string;
  user_id: string;
  challenge_id: string;
}

export interface JobData {
  title: string;
  description: string;
  company: string;
  location?: string;
  salary?: number;
  job_type?: JobType;
  posted_date?: Date;
  application_deadline?: Date;
}

export interface CommentData {
  content: string;
  user_id: string;
  roadmap_id: string;
  parent_id?: string;
}

export interface TicketData {
  title: string;
  description: string;
  category: string;
  priority: string;
  user_id: string;
}

export interface BugReportData {
  title: string;
  description: string;
  severity: string;
  environment?: string;
  steps_to_reproduce?: string;
  expected_behavior?: string;
  actual_behavior?: string;
  user_id: string;
}

export interface FeatureRequestData {
  title: string;
  description: string;
  category: string;
  priority: string;
  user_id: string;
}

export interface HelpArticleData {
  title: string;
  content: string;
  category: string;
  tags: string[];
}

export interface RoadmapTopic {
  topic_id: string;
  order: number;
}

export interface RoadmapSubject {
  subject_id: string;
  order: number;
  topics: RoadmapTopic[];
}

export interface RoadmapMainConcept {
  main_concept_id: string;
  order: number;
  subjects: RoadmapSubject[];
}

export interface CreateRoadmapBody {
  title: string;
  description: string;
  categoryId: string;
  difficulty: Difficulty;
  estimatedHours: number;
  isPublic: boolean;
  version: string;
  tags: string[];
  mainConcepts: RoadmapMainConcept[];
}

export interface DashboardStats {
  enrolledRoadmaps: number;
  totalTopics: number;
  totalTopicsCompleted: number;
  totalHoursSpent: number;
}
