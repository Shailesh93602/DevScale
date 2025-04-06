'use client';

import { useState, useEffect } from 'react';
import { useAxiosGet, useAxiosPost } from '@/hooks/useAxios';
import { CommentItem } from '@/components/Roadmap/CommentItem';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-toastify';
import { Comment } from '@/types';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MessageCircle, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar } from '@/components/ui/avatar';
import { AvatarFallback } from '@/components/ui/avatar';

interface ApiResponse<T> {
  data: T;
  meta: {
    total: number;
    currentPage: number;
    totalPages: number;
    limit: number;
    hasNextPage: boolean;
  };
  success: boolean;
  message: string;
  error: null | string;
}

interface CommentSectionProps {
  roadmapId: string;
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

export const CommentSection = ({ roadmapId }: CommentSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [getComments] = useAxiosGet<ApiResponse<Comment[]>>(
    `/roadmaps/${roadmapId}/comments`,
  );
  const [postComment] = useAxiosPost<ApiResponse<Comment>>(
    `/roadmaps/${roadmapId}/comments`,
  );

  const fetchComments = async (pageNum: number = 1) => {
    setIsLoading(true);
    try {
      const response = await getComments({
        params: {
          page: pageNum,
          limit: 10,
        },
      });

      if (response?.success && Array.isArray(response.data)) {
        const validComments = response.data.filter(isValidComment);

        if (pageNum === 1) {
          setComments(validComments);
        } else {
          setComments((prev) => [...prev, ...validComments]);
        }
        setHasMore(response.meta?.hasNextPage || false);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to fetch comments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [roadmapId]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await postComment({
        content: newComment,
      });

      if (response?.success && response.data) {
        const newCommentData = response.data;
        if (isValidComment(newCommentData)) {
          setComments((prev) => [newCommentData, ...prev]);
          setNewComment('');
          toast.success('Comment posted successfully');
        }
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoadMore = () => {
    if (hasMore) {
      setPage((prev) => prev + 1);
      fetchComments(page + 1);
    }
  };

  const handleCommentUpdate = (updatedComment: Comment) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === updatedComment.id ? updatedComment : comment,
      ),
    );
  };

  return (
    <Card className="mt-8 p-6">
      <div className="mb-6 flex items-center gap-3">
        <MessageCircle className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Discussion</h2>
        <div className="ml-2 text-sm text-muted-foreground">
          {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
        </div>
      </div>

      {/* Comment Input */}
      <Card className="mb-6 bg-muted/50 p-4">
        <div className="flex gap-4">
          <Avatar className="h-10 w-10">
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              placeholder="Share your thoughts..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="mb-2 min-h-[100px] bg-background"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSubmitComment}
                disabled={isSubmitting || !newComment.trim()}
                className="gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Post Comment
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Separator className="my-6" />

      {/* Comments List */}
      <AnimatePresence mode="popLayout">
        <div className="space-y-6">
          {comments.map((comment, index) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <CommentItem
                comment={comment}
                roadmapId={roadmapId}
                onCommentUpdate={handleCommentUpdate}
              />
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Load More Button */}
      {hasMore && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            variant="outline"
            onClick={handleLoadMore}
            className="mt-6 w-full"
          >
            Load More Comments
          </Button>
        </motion.div>
      )}

      {/* Empty State */}
      {!isLoading && comments.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-8 text-center"
        >
          <MessageCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-medium">No comments yet</p>
          <p className="text-sm text-muted-foreground">
            Be the first to share your thoughts!
          </p>
        </motion.div>
      )}
    </Card>
  );
};
