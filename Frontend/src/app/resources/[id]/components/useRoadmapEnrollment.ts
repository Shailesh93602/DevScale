import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAxiosGet, useAxiosPost } from '@/hooks/useAxios';

/** Enrollment state for the roadmap the learner arrived from, if any. */
export function useRoadmapEnrollment(roadmapId: string | null) {
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollInRoadmap] = useAxiosPost('/roadmaps/enroll');
  const [getRoadmapDetails] = useAxiosGet<{ isEnrolled: boolean }>(
    '/roadmaps/{{roadmapId}}',
  );

  useEffect(() => {
    if (roadmapId) {
      getRoadmapDetails({}, { roadmapId })
        .then((resp) => {
          if (resp?.success && resp?.data?.isEnrolled) {
            setIsEnrolled(true);
          }
        })
        .catch(console.error);
    }
  }, [roadmapId, getRoadmapDetails]);

  const handleEnroll = async () => {
    if (isEnrolling || !roadmapId) return;
    setIsEnrolling(true);
    try {
      const response = await enrollInRoadmap({ roadmapId });
      if (response?.success) {
        setIsEnrolled(true);
        if (response.message?.toLowerCase().includes('already')) {
          toast.info("You're already enrolled in this roadmap");
        } else {
          toast.success("Awesome! You're now enrolled ✨");
        }
      } else {
        toast.error('Unable to enrol you in this roadmap. Please try again.');
      }
    } catch {
      toast.error('Unable to enrol you in this roadmap. Please try again.');
    } finally {
      setIsEnrolling(false);
    }
  };

  return { isEnrolled, isEnrolling, handleEnroll };
}
