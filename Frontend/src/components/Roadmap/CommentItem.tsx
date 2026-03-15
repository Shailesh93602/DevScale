import { useState } from 'react';
import { Comment } from '@/types';
import { useAxiosPost } from '@/hooks/useAxios';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-toastify';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Heart,
  Reply,
  MoreVertical,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface CommentItemProps {
  comment: Comment;
  roadmapId: string;
  onCommentUpdate: (updatedComment: Comment) => void;
  depth?: number;
  maxDepth?: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Type guard to check if an object is a Comment
const isComment = (obj: unknown): obj is Comment => {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  return (
    'id' in obj &&
    'content' in obj &&
    'created_at' in obj &&
    'updated_at' in obj &&
    'user' in obj &&
    '_count' in obj
  );
};

export const CommentItem = ({
  comment,
  roadmapId,
  onCommentUpdate,
  depth = 0,
  maxDepth = 3,
}: CommentItemProps) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReplies, setShowReplies] = useState(depth === 0);
  const [isLiking, setIsLiking] = useState(false);

  const [postReply] = useAxiosPost<ApiResponse<Comment>>(
    `/roadmaps/${roadmapId}/comments`,
  );

  const [toggleLike] = useAxiosPost<ApiResponse<Comment>>(
    `/roadmaps/${roadmapId}/comments/${comment.id}/like`,
  );

  const handleReply = async () => {
    if (!replyContent.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await postReply({
        content: replyContent,
        parent_id: comment.id,
      });

      if (response?.success && response.data) {
        const newReply = response.data;
        const updatedComment = {
          ...comment,
          replies: [...(comment.replies || []), newReply],
          _count: {
            ...comment._count,
            replies: (comment._count.replies || 0) + 1,
          },
        } as Comment;

        // Clear the input and hide the reply box
        setReplyContent('');
        setIsReplying(false);
        setShowReplies(true);
        toast.success('Awesome! Your reply is now live ✨');

        // Update the parent comment with the new reply
        onCommentUpdate(updatedComment);
      }
    } catch (error) {
      console.error('Error posting reply:', error);
      toast.error('Failed to post reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async () => {
    if (isLiking) return; // Prevent multiple clicks while API call is in progress

    setIsLiking(true);

    // Optimistic update
    const optimisticComment = {
      ...comment,
      isLiked: !comment.isLiked,
      _count: {
        ...comment._count,
        likes: comment._count.likes + (comment.isLiked ? -1 : 1),
      },
    } as Comment;
    onCommentUpdate(optimisticComment);

    try {
      const response = await toggleLike({});
      if (response?.success && response.data && isComment(response.data)) {
        // Update with actual server response
        onCommentUpdate(response.data);
      } else {
        // Revert optimistic update if API call fails
        onCommentUpdate(comment);
        toast.error('Failed to update like status');
      }
    } catch (error) {
      // Revert optimistic update on error
      onCommentUpdate(comment);
      console.error('Error toggling like:', error);
      toast.error('Failed to toggle like');
    } finally {
      setIsLiking(false);
    }
  };

  const hasReplies = comment.replies && comment.replies.length > 0;
  const canReply = depth < maxDepth;

  return (
    <Card
      className={cn(
        'bg-card p-4',
        depth > 0 && 'border-l-primary/10 border-l-4',
      )}
    >
      <div className="flex gap-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={comment.user.avatar_url || ''} />
          <AvatarFallback>
            {comment.user.first_name?.[0]?.toUpperCase() ||
              comment.user.username[0].toUpperCase() ||
              'U'}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold">
                {comment.user.first_name && comment.user.last_name
                  ? `${comment.user.first_name} ${comment.user.last_name}`
                  : comment.user.first_name || comment.user.username}
              </span>
              <span className="ml-2 text-sm text-muted-foreground">
                @{comment.user.username}
              </span>
              <span className="ml-2 text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(comment.created_at), {
                  addSuffix: true,
                })}
              </span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Report</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <p className="mt-2 text-sm">{comment.content}</p>

          <div className="mt-4 flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'gap-2 transition-all duration-200 ease-in-out',
                comment.isLiked
                  ? 'hover:text-primary/80 text-primary'
                  : 'text-muted-foreground hover:text-primary',
              )}
              onClick={handleLike}
              disabled={isLiking}
            >
              {isLiking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Heart
                  className={cn(
                    'h-4 w-4 transition-all duration-200 ease-in-out',
                    comment.isLiked && 'fill-current',
                  )}
                />
              )}
              <span className="transition-all duration-200">
                {comment._count.likes}
              </span>
            </Button>

            {canReply && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-muted-foreground hover:text-primary"
                onClick={() => setIsReplying(!isReplying)}
              >
                <Reply className="h-4 w-4" />
                Reply
              </Button>
            )}

            {hasReplies && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-muted-foreground hover:text-primary"
                onClick={() => setShowReplies(!showReplies)}
              >
                {showReplies ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                {comment._count.replies}{' '}
                {comment._count.replies === 1 ? 'reply' : 'replies'}
              </Button>
            )}
          </div>

          <AnimatePresence>
            {isReplying && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                <Textarea
                  placeholder="Write a reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="mb-2 min-h-[80px]"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsReplying(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleReply}
                    disabled={isSubmitting || !replyContent.trim()}
                    className="gap-2"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Reply'
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Nested Replies */}
          <AnimatePresence>
            {hasReplies && showReplies && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 space-y-4"
              >
                {comment.replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    roadmapId={roadmapId}
                    onCommentUpdate={(updatedReply) => {
                      const updatedReplies = comment.replies?.map((r) =>
                        r.id === updatedReply.id ? updatedReply : r,
                      );
                      onCommentUpdate({
                        ...comment,
                        replies: updatedReplies || [],
                      });
                    }}
                    depth={depth + 1}
                    maxDepth={maxDepth}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Card>
  );
};
