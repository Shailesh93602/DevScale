import React, { useEffect, useState } from 'react';
import { useAxiosGet, useAxiosPost } from '@/hooks/useAxios';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { CommentItem } from './CommentItem';
import { Comment } from '@/types';

interface CommentSectionProps {
  roadmapId: string;
  isOpen: boolean;
}

const isValidComment = (comment: unknown): comment is Comment => {
  return (
    comment !== null &&
    typeof comment === 'object' &&
    'id' in comment &&
    'content' in comment &&
    'user' in comment &&
    'created_at' in comment &&
    'updated_at' in comment &&
    'isLiked' in comment &&
    '_count' in comment
  );
};

export const CommentSection: React.FC<CommentSectionProps> = ({
  roadmapId,
  isOpen,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [fetchComments, { data: commentsData, isLoading }] = useAxiosGet<
    Comment[]
  >(`/roadmaps/${roadmapId}/comments`);

  const [postComment] = useAxiosPost<Comment>(
    `/roadmaps/${roadmapId}/comments`,
  );

  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen, fetchComments]);

  useEffect(() => {
    if (commentsData) {
      setComments(commentsData);
    }
  }, [commentsData]);

  const handleCommentUpdate = (updatedComment: Comment) => {
    setComments((prevComments) =>
      prevComments.map((comment) =>
        comment.id === updatedComment.id ? updatedComment : comment,
      ),
    );
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await postComment({ content: newComment });

      if (response?.success && response?.data) {
        const newCommentData = response.data;
        if (isValidComment(newCommentData)) {
          setNewComment('');
          setComments((prevComments) => [newCommentData, ...prevComments]);
          toast.success('Great! Your comment is now live ✨');
        }
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="space-y-6 border-t pt-6">
      <h3 className="text-lg font-semibold">Comments</h3>

      {/* Comment Form */}
      <form onSubmit={handleSubmitComment} className="space-y-4">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="min-h-[100px]"
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting || !newComment.trim()}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Post Comment
          </Button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : comments && comments.length > 0 ? (
          comments.map((comment) => {
            return (
              <CommentItem
                key={comment.id}
                comment={comment}
                roadmapId={roadmapId}
                onCommentUpdate={handleCommentUpdate}
              />
            );
          })
        ) : (
          <p className="text-center text-muted-foreground">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>
    </div>
  );
};
