import { useAxiosPost } from './useAxios';
import { toast } from 'react-toastify';

export const useRoadmapSocial = () => {
  const [executeLike] = useAxiosPost<{ success: boolean; message: string }>(
    '/roadmaps/{{id}}/like',
  );
  const [executeBookmark] = useAxiosPost<{ success: boolean; message: string }>(
    '/roadmaps/{{id}}/bookmark',
  );

  const handleLike = async (roadmapId: string): Promise<void> => {
    try {
      const response = await executeLike(null, undefined, { id: roadmapId });
      if (!response.success) {
        throw new Error(response.message || 'Failed to update like status');
      }
    } catch (error) {
      console.error('Failed to update like status:', error);
      toast.error('Failed to update like status');
      throw error;
    }
  };

  const handleBookmark = async (roadmapId: string): Promise<void> => {
    try {
      const response = await executeBookmark(null, undefined, {
        id: roadmapId,
      });
      if (!response.success) {
        throw new Error(response.message || 'Failed to update bookmark status');
      }
    } catch (error) {
      console.error('Failed to update bookmark status:', error);
      toast.error('Failed to update bookmark status');
      throw error;
    }
  };

  return {
    handleLike,
    handleBookmark,
  };
};
