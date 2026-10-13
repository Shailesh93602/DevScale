import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAxiosGet, useAxiosPost } from '@/hooks/useAxios';
import type { ResourceType } from './resourceTypes';

/** The subject's topics, the selected topic's article, and completion toggling. */
export function useResourceTopics(id: string) {
  const [resource, setResource] = useState<ResourceType[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<ResourceType>();
  const [currentArticle, setCurrentArticle] = useState<{
    content: string;
  } | null>(null);

  const [getResource, { isLoading: isTopicsLoading }] = useAxiosGet<{
    topics: ResourceType[];
  }>('/subjects/{{subjectId}}/topics');
  const [getArticle, { isLoading: isArticleLoading }] = useAxiosGet<
    { id: string; title: string; content: string }[]
  >('/topics/{{topicId}}/article');
  const [updateProgress, { isLoading: isUpdatingProgress }] = useAxiosPost<{
    success?: boolean;
    message?: string;
  }>('/progress/update');

  const fetchResource = async () => {
    try {
      const response = await getResource({}, { subjectId: id });

      if (response && !response?.error) {
        const topics =
          response?.data?.topics?.sort(
            (a, b) => a?.topic?.order - b?.topic?.order,
          ) ?? [];
        setResource(topics);
        setSelectedTopic(topics[0] || undefined);
      } else {
        toast.error(
          response?.message ??
            'Unable to load this resource. Please refresh the page.',
        );
      }
    } catch (error) {
      toast.error('Unable to load this resource. Please refresh the page.');
      console.error(error);
    }
  };

  const fetchArticle = async (topicId: string) => {
    try {
      const response = await getArticle({}, { topicId });
      if (response.success && response.data && response.data.length > 0) {
        setCurrentArticle(response.data[0]);
      } else {
        setCurrentArticle(null);
        if (response.success) {
          toast.info('No article found for this topic');
        } else {
          toast.error('Unable to load this article. Please refresh the page.');
        }
      }
    } catch (error) {
      setCurrentArticle(null);
      toast.error('Unable to load this article. Please refresh the page.');
      console.error(error);
    }
  };

  const applyCompletion = (topicId: string, isCompleted: boolean) => {
    setResource((prev) =>
      prev.map((item) =>
        item.topic.id === topicId
          ? { ...item, topic: { ...item.topic, isCompleted } }
          : item,
      ),
    );
    setSelectedTopic((prev) =>
      prev ? { ...prev, topic: { ...prev.topic, isCompleted } } : undefined,
    );
  };

  const handleMarkCompleted = async () => {
    if (!selectedTopic?.topic?.id) return;
    const wasCompleted = selectedTopic.topic.isCompleted;

    try {
      const response = await updateProgress({
        topicId: selectedTopic.topic.id,
        status: wasCompleted ? 'in_progress' : 'completed',
        score: 10,
      });

      if (response.success) {
        toast.success(
          wasCompleted
            ? 'Topic marked as in progress'
            : 'Topic marked as completed',
        );
        // Update local state instead of re-fetching (avoids the skeleton loader)
        applyCompletion(selectedTopic.topic.id, !wasCompleted);
      } else {
        toast.error('Unable to save your progress. Please try again.');
      }
    } catch {
      toast.error('Unable to save your progress. Please try again.');
    }
  };

  useEffect(() => {
    fetchResource();
  }, [id]);

  useEffect(() => {
    if (selectedTopic?.topic?.id) {
      fetchArticle(selectedTopic.topic.id);
    }
  }, [selectedTopic]);

  return {
    resource,
    selectedTopic,
    setSelectedTopic,
    currentArticle,
    isTopicsLoading,
    isArticleLoading,
    isUpdatingProgress,
    handleMarkCompleted,
  };
}
