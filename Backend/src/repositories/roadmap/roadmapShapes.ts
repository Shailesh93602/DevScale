/** Public author fields embedded in roadmap and comment payloads. */
export const authorSelect = {
  id: true,
  username: true,
  first_name: true,
  last_name: true,
  avatar_url: true,
} as const;

export const roadmapCountSelect = {
  select: {
    likes: true,
    comments: { where: { parent_id: null } },
    user_roadmaps: true,
    topics: true,
  },
} as const;

/** The viewer's own like/bookmark rows; omitted entirely for guests. */
export function viewerRelations(userId?: string) {
  return {
    likes: userId
      ? { where: { user_id: userId }, select: { id: true } }
      : (false as const),
    user_roadmaps: userId
      ? { where: { user_id: userId }, select: { id: true } }
      : (false as const),
  };
}

export interface RoadmapListItem {
  id: string;
  _count: {
    likes: number;
    comments: number;
    user_roadmaps: number;
    topics: number;
  };
  likes?: Array<{ id: string }>;
  user_roadmaps?: Array<{ id: string }>;
  topics?: Array<{ topic: { id: string; title: string } }>;
  estimatedHours?: number | null;
  popularity?: number;
}

/** Derived engagement/progress fields shared by the detail and list views. */
export function roadmapViewFields(
  roadmap: Pick<
    RoadmapListItem,
    '_count' | 'likes' | 'user_roadmaps' | 'estimatedHours' | 'popularity'
  >,
  progress: number
) {
  return {
    likesCount: roadmap._count.likes,
    commentsCount: roadmap._count.comments,
    bookmarksCount: roadmap._count.user_roadmaps,
    isLiked: Boolean(roadmap.likes?.length),
    isBookmarked: Boolean(roadmap.user_roadmaps?.length),
    steps: roadmap._count.topics,
    isEnrolled: Boolean(roadmap.user_roadmaps?.length),
    progress,
    estimatedTime: roadmap.estimatedHours
      ? `${roadmap.estimatedHours} hours`
      : undefined,
    isFeatured: (roadmap.popularity ?? 0) > 100,
  };
}

/** A top-level comment with its replies, as the comment thread renders it. */
export const commentThreadInclude = {
  user: { select: authorSelect },
  replies: {
    include: {
      user: { select: authorSelect },
      _count: { select: { likes: true } },
    },
  },
  _count: { select: { likes: true, replies: true } },
} as const;
