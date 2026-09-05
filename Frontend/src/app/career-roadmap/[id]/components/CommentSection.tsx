import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Comment } from '@/types';
import { useAxiosGet, useAxiosPost } from '@/hooks/useAxios';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-toastify';
import { CommentItem } from '@/components/Roadmap/CommentItem';
import { CommentSkeleton } from '@/components/Roadmap/CommentSkeleton';

interface CommentSectionProps {
  roadmapId: string;
  /** Visitors can read the thread; only members get the composer. */
  isAuthenticated?: boolean;
}

export const CommentSection = ({
  roadmapId,
  isAuthenticated = true,
}: CommentSectionProps) => {
  const pathname = usePathname();
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
        toast.error('Unable to load the comments. Please refresh the page.');
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
      toast.error('Unable to post your comment. Please try again.');
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
      {isAuthenticated ? (
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
      ) : (
        <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            You can read the discussion as a visitor. Sign in to join it.
          </p>
          <Button asChild variant="outline">
            <Link
              href={`/auth/login?callbackUrl=${encodeURIComponent(`${pathname || '/career-roadmap'}?comments=open`)}`}
            >
              Sign in to comment
            </Link>
          </Button>
        </div>
      )}

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
