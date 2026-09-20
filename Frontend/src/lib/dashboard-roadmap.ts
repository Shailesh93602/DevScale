import type { RoadmapType } from '@/components/Roadmap/RoadmapCard';
import type { RoadmapSummary } from '@/hooks/useDashboard';
import { roadmapAuthorName } from '@/lib/roadmap-author';

/**
 * Map a `/dashboard/summary` roadmap onto the shape `RoadmapCard` renders.
 *
 * 🔴 FIELDS THE SUMMARY ENDPOINT DOES NOT RETURN ARE LEFT OUT, NOT INVENTED.
 *
 * This used to hardcode `estimatedTime: '2-3 hours'` and
 * `difficulty: 'beginner'`. `RoadmapCard` renders each of those whenever it is
 * truthy (a Clock badge and an uppercase difficulty Badge), and a literal is
 * always truthy — so EVERY roadmap card on the dashboard advertised "2-3 hours"
 * and "BEGINNER" regardless of how long or how hard the roadmap actually is.
 * `shapeRoadmap` in `Backend/src/repositories/dashboardRepository.ts` returns
 * only id, title, description, user and `_count.topics`; neither field exists
 * in the payload at all, so there was nothing to be approximately right about.
 *
 * `/career-roadmap/roadmaps` already does this correctly — it derives
 * `estimatedTime` from the real `estimatedHours` and leaves it `undefined`
 * when the API did not send one. Same rule here: no data, no badge.
 */
export const mapToRoadmapType = (
  roadmap: RoadmapSummary,
  isEnrolled: boolean,
): RoadmapType => ({
  id: roadmap.id,
  title: roadmap.title,
  author: {
    id: roadmap.user?.id || 'anonymous',
    name: roadmapAuthorName(roadmap.user, 'Anonymous'),
    profileImage: roadmap.user?.avatar_url,
  },
  thumbnail: roadmap.thumbnail,
  isEnrolled,
  likesCount: roadmap._count?.likes || 0,
  commentsCount: 0,
  bookmarksCount: roadmap._count?.user_roadmaps || 0,
  isLiked: Boolean(roadmap.likes?.length),
  isBookmarked: Boolean(roadmap.user_roadmaps?.length),
  description: (roadmap.description as string) || '',
  enrollmentCount: roadmap._count?.user_roadmaps || 0,
  progress: 0,
  steps: roadmap._count?.topics || 0,
  // estimatedTime / difficulty / rating / createdAt / updatedAt: deliberately
  // absent. The summary endpoint does not return them. `rating` and the two
  // timestamps were placeholder literals ('2024-01-01T00:00:00.000Z') that
  // RoadmapCard happens not to render today — removed anyway, so a future card
  // change cannot start displaying them.
});
