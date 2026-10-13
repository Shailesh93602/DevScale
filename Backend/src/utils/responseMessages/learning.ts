import type { ResponseConfig } from './types.js';

/** Learning content: topics, subjects, articles, quizzes, roadmaps, courses, challenges. */
export const learningMessages = {
  TOPICS_FETCHED: {
    status: 200,
    success: true,
    message: 'Unpublished topics retrieved successfully',
  },
  TOPIC_NOT_FOUND: {
    status: 404,
    success: false,
    message: 'Topic not found',
  },
  ARTICLE_FETCHED: {
    status: 200,
    success: true,
    message: 'Article retrieved successfully',
  },
  ARTICLE_NOT_FOUND: {
    status: 404,
    success: false,
    message: 'Article not found',
  },
  ARTICLES_FETCHED: {
    status: 200,
    success: true,
    message: 'Articles retrieved successfully',
  },
  QUIZ_FETCHED: {
    status: 200,
    success: true,
    message: 'Quiz retrieved successfully',
  },
  QUIZ_NOT_FOUND: {
    status: 404,
    success: false,
    message: 'Quiz not found',
  },
  QUIZ_SUBMITTED: {
    status: 200,
    success: true,
    message: 'Quiz submitted successfully',
  },
  QUIZ_PASSED: {
    status: 200,
    success: true,
    message: 'Quiz passed!',
  },
  QUIZ_FAILED: {
    status: 200,
    success: false,
    message: 'Quiz failed',
  },
  SUBJECTS_FETCHED: {
    status: 200,
    success: true,
    message: 'Subjects retrieved successfully',
  },
  SUBJECT_NOT_FOUND: {
    status: 404,
    success: false,
    message: 'Subject not found',
  },
  ROADMAPS_FETCHED: {
    status: 200,
    success: true,
    message: 'Roadmaps retrieved successfully',
  },
  MAIN_CONCEPTS_FETCHED: {
    status: 200,
    success: true,
    message: 'Main concepts retrieved successfully',
  },
  ROADMAP_NOT_FOUND: {
    status: 404,
    success: false,
    message: 'Roadmap not found',
  },
  ROADMAP_ENROLLED: {
    status: 200,
    success: true,
    message: 'Roadmap enrolled successfully',
  },
  INVALID_ROADMAP_ID: {
    status: 400,
    success: false,
    message: 'Invalid roadmap ID',
  },
  ROADMAP_ALREADY_ENROLLED: {
    status: 200,
    success: true,
    message: 'Roadmap already enrolled',
  },
  COURSES_FETCHED: {
    status: 200,
    success: true,
    message: 'Courses retrieved successfully',
  },
  COURSE_FETCHED: {
    status: 200,
    success: true,
    message: 'Course retrieved successfully',
  },
  COURSE_NOT_FOUND: {
    status: 404,
    success: false,
    message: 'Course not found',
  },
  COURSE_ENROLLED: {
    status: 201,
    success: true,
    message: 'Enrolled in course successfully',
  },
  COURSE_ALREADY_ENROLLED: {
    status: 400,
    success: false,
    message: 'Already enrolled in this course',
  },
  ENROLLMENTS_FETCHED: {
    status: 200,
    success: true,
    message: 'Enrollments retrieved successfully',
  },
  ENROLLMENT_NOT_FOUND: {
    status: 404,
    success: false,
    message: 'Enrollment not found',
  },
  ENROLLMENT_UPDATED: {
    status: 200,
    success: true,
    message: 'Enrollment updated successfully',
  },
  CHALLENGES_FETCHED: {
    status: 200,
    success: true,
    message: 'Challenges retrieved successfully',
  },
  CHALLENGE_FETCHED: {
    status: 200,
    success: true,
    message: 'Challenge retrieved successfully',
  },
  CHALLENGE_NOT_FOUND: {
    status: 404,
    success: false,
    message: 'Challenge not found',
  },
  CHALLENGE_CREATED: {
    status: 201,
    success: true,
    message: 'Challenge created successfully',
  },
  CHALLENGE_UPDATED: {
    status: 200,
    success: true,
    message: 'Challenge updated successfully',
  },
  CHALLENGE_SUBMITTED: {
    status: 200,
    success: true,
    message: 'Challenge submitted successfully',
  },
  ROADMAP_FETCHED: {
    status: 200,
    success: true,
    message: 'Roadmap retrieved successfully',
  },
  ROADMAP_CREATED: {
    status: 201,
    success: true,
    message: 'Roadmap created successfully',
  },
  ROADMAP_UPDATED: {
    status: 200,
    success: true,
    message: 'Roadmap updated successfully',
  },
  ARTICLE_UPDATED: {
    status: 200,
    success: true,
    message: 'Article updated successfully',
  },
  MAIN_CONCEPT_CREATED: {
    status: 201,
    success: true,
    message: 'Main concept created successfully',
  },
  MAIN_CONCEPT_UPDATED: {
    status: 200,
    success: true,
    message: 'Main concept updated successfully',
  },
  MAIN_CONCEPT_DELETED: {
    status: 200,
    success: true,
    message: 'Main concept deleted successfully',
  },
  MAIN_CONCEPT_NOT_FOUND: {
    status: 404,
    success: false,
    message: 'Main concept not found',
  },
  MAIN_CONCEPT_FETCHED: {
    status: 200,
    success: true,
    message: 'Main concept fetched successfully',
  },
  RESOURCES_FETCHED: {
    status: 200,
    success: true,
    message: 'Resources fetched successfully',
  },
  BOOKS_FETCHED: {
    status: 200,
    success: true,
    message: 'Books fetched successfully',
  },
  QUESTIONS_FETCHED: {
    status: 200,
    success: true,
    message: 'Questions fetched successfully',
  },
  TOPIC_ADDED: {
    status: 201,
    success: true,
    message: 'Topic added successfully',
  },
  CODE_EXECUTED: {
    status: 200,
    success: true,
    message: 'Code executed successfully',
  },
  RESOURCE_FETCHED: {
    status: 200,
    success: true,
    message: 'Resource fetched successfully',
  },
  SUBJECTS_CREATED: {
    status: 201,
    success: true,
    message: 'Subjects created successfully',
  },
  SUBJECTS_DELETED: {
    status: 200,
    success: true,
    message: 'Subjects deleted successfully',
  },
  ARTICLE_CREATED: {
    status: 201,
    success: true,
    message: 'Article created successfully',
  },
  INTERVIEW_QUESTIONS_FETCHED: {
    status: 200,
    success: true,
    message: 'Interview questions fetched successfully',
  },
  SUBJECT_UPDATED: {
    status: 200,
    success: true,
    message: 'Subject updated successfully',
  },
  SUBJECT_DELETED: {
    status: 200,
    success: true,
    message: 'Subject deleted successfully',
  },
  RESOURCE_CREATED: {
    status: 201,
    success: true,
    message: 'Resource created successfully',
  },
  RESOURCE_DETAILS_FETCHED: {
    status: 200,
    success: true,
    message: 'Resource details fetched successfully',
  },
  ROADMAP_DELETED: {
    status: 200,
    success: true,
    message: 'Roadmap deleted successfully',
  },
  ROADMAP_CATEGORIES_FETCHED: {
    status: 200,
    success: true,
    message: 'Roadmap categories fetched successfully',
  },
  SUBJECT_CREATED: {
    status: 201,
    success: true,
    message: 'Subject created successfully',
  },
  ROADMAP_REMOVED: {
    status: 200,
    success: true,
    message: 'Roadmap removed successfully',
  },
  ROADMAP_LIKED: {
    status: 200,
    success: true,
    message: 'Roadmap liked successfully',
  },
  ROADMAP_UNLIKED: {
    status: 200,
    success: true,
    message: 'Roadmap unliked successfully',
  },
  ROADMAP_BOOKMARKED: {
    status: 200,
    success: true,
    message: 'Roadmap bookmarked successfully',
  },
  ROADMAP_UNBOOKMARKED: {
    status: 200,
    success: true,
    message: 'Roadmap unbookmarked successfully',
  },
  COMMENTS_FETCHED: {
    status: 200,
    success: true,
    message: 'Comments fetched successfully',
  },
  COMMENT_ADDED: {
    status: 200,
    success: true,
    message: 'Comment added successfully',
  },
  COMMENT_LIKED: {
    status: 200,
    success: true,
    message: 'Comment liked successfully',
  },
  COMMENT_UNLIKED: {
    status: 200,
    success: true,
    message: 'Comment unliked successfully',
  },
  DRAFT_SAVED: {
    status: 200,
    success: true,
    message: 'Progress saved successfully',
  },
  DRAFT_FETCHED: {
    status: 200,
    success: true,
    message: 'Progress retrieved successfully',
  },
} satisfies Record<string, ResponseConfig>;
