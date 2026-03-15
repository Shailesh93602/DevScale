import { useState, useEffect } from 'react';
import { Comment } from '@/types';
import { useAxiosGet, useAxiosPost } from '@/hooks/useAxios';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-toastify';
import { CommentItem } from '@/components/Roadmap/CommentItem';
import { CommentSkeleton } from '@/components/Roadmap/CommentSkeleton';

interface CommentSectionProps {
  roadmapId: string;
}

export const CommentSection = ({ roadmapId }: CommentSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [getComments] = useAxiosGet<Comment[]>(
    `/roadmaps/${roadmapId}/comments`,
  );

  const [postComment] = useAxiosPost<Comment>(
    `/roadmaps/${roadmapId}/comments`,
  );

  useEffect(() => {
    const fetchComments = async () => {
      setIsLoading(true);
      try {
        const response = await getComments();
        if (response?.success && response.data) {
          setComments(response.data);
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
        toast.error('Failed to load comments');
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [roadmapId, getComments]);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await postComment({ content: newComment });
      if (response?.success && response.data) {
        setComments((prev) => [response.data, ...prev]);
        setNewComment('');
        toast.success('Great! Your comment is now live ✨');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommentUpdate = (updatedComment: Comment) => {
    setComments((prevComments) =>
      prevComments.map((comment) =>
        comment.id === updatedComment.id ? updatedComment : comment,
      ),
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Textarea
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[100px]"
        />
        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !newComment.trim()}
          >
            Post Comment
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <CommentSkeleton />
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              roadmapId={roadmapId}
              onCommentUpdate={handleCommentUpdate}
            />
          ))
        ) : (
          <div className="text-center text-muted-foreground">
            No comments yet. Be the first to comment!
          </div>
        )}
      </div>
    </div>
  );
};
