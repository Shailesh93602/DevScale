import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { showLoader, hideLoader } from '@/lib/features/loader/loaderSlice';
import { RoadmapDetails, IRoadmap } from '../RoadmapDetail';
import { useAxiosGet, useAxiosPost } from '@/hooks/useAxios';
import { useRoadmapSocial } from '@/hooks/useRoadmapSocial';

export const useRoadmapDetail = (careerId: string) => {
  const dispatch = useDispatch();
  const { handleLike, handleBookmark } = useRoadmapSocial();
  const [isLoading, setIsLoading] = useState(true);
  const [roadmap, setRoadmap] = useState<IRoadmap[]>([]);
  const [roadmapDetails, setRoadmapDetails] = useState<RoadmapDetails | null>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);
  
  const [socialActionLoading, setSocialActionLoading] = useState({
    like: false,
    bookmark: false,
  });

  const [optimisticState, setOptimisticState] = useState<{
    isLiked: boolean;
    likesCount: number;
    isBookmarked: boolean;
    bookmarksCount: number;
  } | null>(null);

  const [getRoadmapDetails] = useAxiosGet<
    RoadmapDetails & { main_concepts: IRoadmap[] }
  >('/roadmaps/{{careerId}}');

  const [enrollInRoadmap] = useAxiosPost('/roadmaps/enroll');

  const fetchResources = useCallback(async () => {
    setIsLoading(true);
    dispatch(showLoader('fetching roadmap'));
    try {
      const detailsResponse = await getRoadmapDetails({}, { careerId });
      const roadmapData = detailsResponse.data;

      if (roadmapData) {
        setRoadmapDetails(roadmapData);
        setRoadmap(roadmapData.main_concepts || []);
      }
    } catch {
      toast.error('Error fetching resources. Please try again');
    } finally {
      dispatch(hideLoader('fetching roadmap'));
      setIsLoading(false);
    }
  }, [careerId, dispatch, getRoadmapDetails]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  useEffect(() => {
    if (roadmapDetails) {
      setOptimisticState({
        isLiked: roadmapDetails.isLiked,
        likesCount: roadmapDetails.likesCount,
        isBookmarked: roadmapDetails.isBookmarked,
        bookmarksCount: roadmapDetails.bookmarksCount,
      });
    }
  }, [roadmapDetails]);

  const handleEnroll = async () => {
    if (isEnrolling || !careerId) return;
    setIsEnrolling(true);
    try {
      const response = await enrollInRoadmap({ roadmapId: careerId });
      if (response?.success) {
        toast.success("Awesome! You're now enrolled ✨");
        if (roadmapDetails) {
          setRoadmapDetails({
            ...roadmapDetails,
            isEnrolled: true,
            enrollmentCount: (roadmapDetails.enrollmentCount || 0) + 1,
          });
        }
      } else {
        toast.error('Failed to enroll. Please try again.');
      }
    } catch {
      toast.error('Failed to enroll. Please try again.');
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleSocialAction = async (
    action: (id: string) => Promise<void>,
    type: 'like' | 'bookmark',
  ) => {
    if (socialActionLoading[type]) return;

    try {
      setSocialActionLoading((prev) => ({ ...prev, [type]: true }));

      // Optimistic update
      if (type === 'like') {
        setOptimisticState((prev) =>
          prev ? {
            ...prev,
            isLiked: !prev.isLiked,
            likesCount: prev.isLiked ? prev.likesCount - 1 : prev.likesCount + 1,
          } : null
        );
      } else {
        setOptimisticState((prev) =>
          prev ? {
            ...prev,
            isBookmarked: !prev.isBookmarked,
            bookmarksCount: prev.isBookmarked ? prev.bookmarksCount - 1 : prev.bookmarksCount + 1,
          } : null
        );
      }

      await action(careerId);
    } catch {
      if (roadmapDetails) {
        setOptimisticState({
          isLiked: roadmapDetails.isLiked,
          likesCount: roadmapDetails.likesCount,
          isBookmarked: roadmapDetails.isBookmarked,
          bookmarksCount: roadmapDetails.bookmarksCount,
        });
      }
      toast.error(`Failed to ${type} roadmap`);
    } finally {
      setSocialActionLoading((prev) => ({ ...prev, [type]: false }));
    }
  };

  return {
    isLoading,
    roadmap,
    roadmapDetails,
    isEnrolling,
    socialActionLoading,
    optimisticState,
    handleEnroll,
    handleSocialAction,
    handleLike,
    handleBookmark,
  };
};
