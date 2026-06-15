/**
 * Code-level enums — the single source of truth.
 *
 * These were Postgres `enum` types. DB enums are painful to evolve (adding /
 * renaming / removing a value needs a migration and can't be done in a simple
 * transaction), so the columns are now plain `String` and the allowed values
 * live here + in the request validators. To change a value: edit here (+ the
 * matching Joi/validator) — no DB migration needed.
 *
 * Each export is a `const` object (so `Status.PENDING` keeps working) plus a
 * union type of its values (so types stay tight).
 */

function values<T extends Record<string, string>>(o: T): T[keyof T][] {
  return Object.values(o) as T[keyof T][];
}

export const BattleType = {
  QUICK: "QUICK",
  SCHEDULED: "SCHEDULED",
  PRACTICE: "PRACTICE",
} as const;
export type BattleType = (typeof BattleType)[keyof typeof BattleType];

export const BattleStatus = {
  WAITING: "WAITING",
  LOBBY: "LOBBY",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;
export type BattleStatus = (typeof BattleStatus)[keyof typeof BattleStatus];

export const BattleParticipantStatus = {
  JOINED: "JOINED",
  READY: "READY",
  PLAYING: "PLAYING",
  COMPLETED: "COMPLETED",
  DISCONNECTED: "DISCONNECTED",
} as const;
export type BattleParticipantStatus =
  (typeof BattleParticipantStatus)[keyof typeof BattleParticipantStatus];

export const Status = {
  DRAFT: "DRAFT",
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;
export type Status = (typeof Status)[keyof typeof Status];

export const Difficulty = {
  EASY: "EASY",
  MEDIUM: "MEDIUM",
  HARD: "HARD",
} as const;
export type Difficulty = (typeof Difficulty)[keyof typeof Difficulty];

export const Length = {
  short: "short",
  medium: "medium",
  long: "long",
} as const;
export type Length = (typeof Length)[keyof typeof Length];

export const CourseLevel = {
  Beginner: "Beginner",
  Intermediate: "Intermediate",
  Advanced: "Advanced",
} as const;
export type CourseLevel = (typeof CourseLevel)[keyof typeof CourseLevel];

export const EnrollmentStatus = {
  ENROLLED: "ENROLLED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  DROPPED: "DROPPED",
} as const;
export type EnrollmentStatus =
  (typeof EnrollmentStatus)[keyof typeof EnrollmentStatus];

export const JobType = {
  full_time: "full_time",
  part_time: "part_time",
  contract: "contract",
  internship: "internship",
} as const;
export type JobType = (typeof JobType)[keyof typeof JobType];

export const ProjectStatus = {
  planning: "planning",
  ongoing: "ongoing",
  completed: "completed",
  archived: "archived",
} as const;
export type ProjectStatus = (typeof ProjectStatus)[keyof typeof ProjectStatus];

export const Visibility = {
  public: "public",
  private: "private",
  unlisted: "unlisted",
} as const;
export type Visibility = (typeof Visibility)[keyof typeof Visibility];

export const ProjectRole = {
  owner: "owner",
  admin: "admin",
  member: "member",
} as const;
export type ProjectRole = (typeof ProjectRole)[keyof typeof ProjectRole];

export const SubmissionStatus = {
  pending: "pending",
  running: "running",
  accepted: "accepted",
  wrong_answer: "wrong_answer",
  time_limit_exceeded: "time_limit_exceeded",
  memory_limit_exceeded: "memory_limit_exceeded",
  runtime_error: "runtime_error",
  compilation_error: "compilation_error",
} as const;
export type SubmissionStatus =
  (typeof SubmissionStatus)[keyof typeof SubmissionStatus];

export const NotificationType = {
  system: "system",
  achievement: "achievement",
  mention: "mention",
  comment: "comment",
  follow: "follow",
  project: "project",
  challenge: "challenge",
  course: "course",
  mentorship: "mentorship",
} as const;
export type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType];

export const MentorshipStatus = {
  pending: "pending",
  active: "active",
  completed: "completed",
  cancelled: "cancelled",
} as const;
export type MentorshipStatus =
  (typeof MentorshipStatus)[keyof typeof MentorshipStatus];

export const ExperienceLevel = {
  beginner: "beginner",
  intermediate: "intermediate",
  advanced: "advanced",
  expert: "expert",
} as const;
export type ExperienceLevel =
  (typeof ExperienceLevel)[keyof typeof ExperienceLevel];

export const GroupRole = {
  admin: "admin",
  moderator: "moderator",
  member: "member",
} as const;
export type GroupRole = (typeof GroupRole)[keyof typeof GroupRole];

export const ChallengeCategory = {
  algorithms: "algorithms",
  data_structures: "data_structures",
  system_design: "system_design",
  databases: "databases",
  web_development: "web_development",
  machine_learning: "machine_learning",
  devops: "devops",
  security: "security",
  frontend: "frontend",
  backend: "backend",
  mobile: "mobile",
  concurrency: "concurrency",
  mathematics: "mathematics",
  bit_manipulation: "bit_manipulation",
  strings: "strings",
} as const;
export type ChallengeCategory =
  (typeof ChallengeCategory)[keyof typeof ChallengeCategory];

export const QuizType = {
  multiple_choice: "multiple_choice",
  coding: "coding",
  theory: "theory",
} as const;
export type QuizType = (typeof QuizType)[keyof typeof QuizType];

export const TicketStatus = {
  open: "open",
  in_progress: "in_progress",
  resolved: "resolved",
  closed: "closed",
} as const;
export type TicketStatus = (typeof TicketStatus)[keyof typeof TicketStatus];

export const TicketPriority = {
  low: "low",
  medium: "medium",
  high: "high",
  urgent: "urgent",
} as const;
export type TicketPriority =
  (typeof TicketPriority)[keyof typeof TicketPriority];

export const ReportStatus = {
  pending: "pending",
  investigating: "investigating",
  resolved: "resolved",
  rejected: "rejected",
} as const;
export type ReportStatus = (typeof ReportStatus)[keyof typeof ReportStatus];

export const RequestStatus = {
  pending: "pending",
  approved: "approved",
  rejected: "rejected",
} as const;
export type RequestStatus = (typeof RequestStatus)[keyof typeof RequestStatus];

export const Severity = {
  low: "low",
  medium: "medium",
  high: "high",
  critical: "critical",
} as const;
export type Severity = (typeof Severity)[keyof typeof Severity];

export const Priority = {
  low: "low",
  medium: "medium",
  high: "high",
  critical: "critical",
} as const;
export type Priority = (typeof Priority)[keyof typeof Priority];

export const ApplicationStatus = {
  pending: "pending",
  reviewed: "reviewed",
  accepted: "accepted",
  rejected: "rejected",
} as const;
export type ApplicationStatus =
  (typeof ApplicationStatus)[keyof typeof ApplicationStatus];

export const CodeReviewStatus = {
  pending: "pending",
  in_review: "in_review",
  completed: "completed",
} as const;
export type CodeReviewStatus =
  (typeof CodeReviewStatus)[keyof typeof CodeReviewStatus];

export const DeviceType = {
  WEB: "WEB",
  MOBILE: "MOBILE",
  TABLET: "TABLET",
  DESKTOP: "DESKTOP",
  UNKNOWN: "UNKNOWN",
} as const;
export type DeviceType = (typeof DeviceType)[keyof typeof DeviceType];

export const ChallengeStatus = {
  DRAFT: "DRAFT",
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  ARCHIVED: "ARCHIVED",
  INACTIVE: "INACTIVE",
} as const;
export type ChallengeStatus =
  (typeof ChallengeStatus)[keyof typeof ChallengeStatus];

export const PlacementStatus = {
  PENDING: "PENDING",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  EVALUATED: "EVALUATED",
} as const;
export type PlacementStatus =
  (typeof PlacementStatus)[keyof typeof PlacementStatus];

export const ContentStatus = {
  DRAFT: "DRAFT",
  PENDING_REVIEW: "PENDING_REVIEW",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  ARCHIVED: "ARCHIVED",
} as const;
export type ContentStatus =
  (typeof ContentStatus)[keyof typeof ContentStatus];

export const ActivityType = {
  TOPIC_COMPLETION: "TOPIC_COMPLETION",
  QUIZ_COMPLETION: "QUIZ_COMPLETION",
  CODE_CHALLENGE: "CODE_CHALLENGE",
  RESOURCE_STUDY: "RESOURCE_STUDY",
  PRACTICE_SESSION: "PRACTICE_SESSION",
} as const;
export type ActivityType = (typeof ActivityType)[keyof typeof ActivityType];

/** All allowed values per enum — handy for building validators. */
export const ENUM_VALUES = {
  BattleType: values(BattleType),
  BattleStatus: values(BattleStatus),
  BattleParticipantStatus: values(BattleParticipantStatus),
  Status: values(Status),
  Difficulty: values(Difficulty),
  Length: values(Length),
  CourseLevel: values(CourseLevel),
  EnrollmentStatus: values(EnrollmentStatus),
  JobType: values(JobType),
  ProjectStatus: values(ProjectStatus),
  Visibility: values(Visibility),
  ProjectRole: values(ProjectRole),
  SubmissionStatus: values(SubmissionStatus),
  NotificationType: values(NotificationType),
  MentorshipStatus: values(MentorshipStatus),
  ExperienceLevel: values(ExperienceLevel),
  GroupRole: values(GroupRole),
  ChallengeCategory: values(ChallengeCategory),
  QuizType: values(QuizType),
  TicketStatus: values(TicketStatus),
  TicketPriority: values(TicketPriority),
  ReportStatus: values(ReportStatus),
  RequestStatus: values(RequestStatus),
  Severity: values(Severity),
  Priority: values(Priority),
  ApplicationStatus: values(ApplicationStatus),
  CodeReviewStatus: values(CodeReviewStatus),
  DeviceType: values(DeviceType),
  ChallengeStatus: values(ChallengeStatus),
  PlacementStatus: values(PlacementStatus),
  ContentStatus: values(ContentStatus),
  ActivityType: values(ActivityType),
} as const;
