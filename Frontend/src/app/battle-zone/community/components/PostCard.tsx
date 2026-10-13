import { useState } from 'react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import {
  MessageCircle,
  MoreHorizontal,
  Send,
  Share,
  ThumbsUp,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { Comment, Post } from './communityTypes';

const relativeTime = (iso: string) =>
  formatDistanceToNow(new Date(iso), { addSuffix: true });

/** Hardcoded placeholder comments: this card never fetches real ones. */
function placeholderComments(): Comment[] {
  return [
    {
      id: '1',
      user: { id: 'user1', username: 'JaneDoe', avatar_url: '/avatars/02.png' },
      content:
        'Great achievement! I&apos;m still working on my first tournament win.',
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      user: {
        id: 'user2',
        username: 'CodeMaster',
        avatar_url: '/avatars/03.png',
      },
      content:
        'Congrats! What strategy did you use for the algorithm questions?',
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
  ];
}

const COMMENT_ACTION_CLASS =
  'h-auto p-0 text-xs text-muted-foreground hover:text-primary';

function CommentItem({ comment }: { comment: Comment }) {
  return (
    <div className="flex gap-3">
      <Avatar className="h-8 w-8">
        <AvatarImage
          src={comment.user.avatar_url}
          alt={comment.user.username}
        />
        <AvatarFallback>
          {comment.user.username.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="rounded-lg bg-muted p-3">
          <div className="font-medium">{comment.user.username}</div>
          <p className="text-sm">{comment.content}</p>
        </div>
        <div className="mt-1 flex gap-4 text-xs text-muted-foreground">
          <Button variant="link" className={COMMENT_ACTION_CLASS}>
            Like
          </Button>
          <Button variant="link" className={COMMENT_ACTION_CLASS}>
            Reply
          </Button>
          <span>{relativeTime(comment.created_at)}</span>
        </div>
      </div>
    </div>
  );
}

function CommentsSection({
  isLoading,
  comments,
}: {
  isLoading: boolean;
  comments: Comment[];
}) {
  return (
    <div className="border-t px-6 py-4">
      <h4 className="mb-4 font-medium">Comments</h4>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-[60px]" />
          <Skeleton className="h-[60px]" />
        </div>
      ) : (
        <>
          <div className="mb-4 space-y-4">
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>

          <div className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/avatars/01.png" alt="Your Avatar" />
              <AvatarFallback>YA</AvatarFallback>
            </Avatar>
            <div className="relative flex-1">
              <Input placeholder="Write a comment..." className="pr-10" />
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-0 top-0 h-full"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function PostHeader({ post }: { post: Post }) {
  return (
    <CardHeader className="pb-3">
      <div className="flex justify-between">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={post.user.avatar_url} alt={post.user.username} />
            <AvatarFallback>
              {post.user.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{post.user.username}</div>
            <div className="text-xs text-muted-foreground">
              {relativeTime(post.created_at)}
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" aria-label="More options">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </CardHeader>
  );
}

export function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(post.has_liked || false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  const toggleLike = () => {
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
    setLiked(!liked);
  };

  const toggleComments = async () => {
    setShowComments(!showComments);

    if (!showComments && comments.length === 0) {
      setIsLoadingComments(true);
      setTimeout(() => {
        setComments(placeholderComments());
        setIsLoadingComments(false);
      }, 1000);
    }
  };

  return (
    <Card>
      <PostHeader post={post} />
      <CardContent>
        <p className="mb-4">{post.content}</p>
        {post.image_url && (
          <div className="mb-4 overflow-hidden rounded-lg">
            <Image
              src={post.image_url}
              alt="Post image"
              className="h-auto w-full object-cover"
              width={500}
              height={500}
            />
          </div>
        )}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <ThumbsUp className="h-4 w-4" />
            <span>{likesCount} likes</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" />
            <span>{post.comments} comments</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t px-6 py-3">
        <div className="flex w-full justify-between">
          <Button
            variant="ghost"
            size="sm"
            className={liked ? 'text-primary' : ''}
            onClick={toggleLike}
          >
            <ThumbsUp className="mr-2 h-4 w-4" />
            Like
          </Button>
          <Button variant="ghost" size="sm" onClick={toggleComments}>
            <MessageCircle className="mr-2 h-4 w-4" />
            Comment
          </Button>
          <Button variant="ghost" size="sm">
            <Share className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </CardFooter>

      {showComments && (
        <CommentsSection isLoading={isLoadingComments} comments={comments} />
      )}
    </Card>
  );
}
