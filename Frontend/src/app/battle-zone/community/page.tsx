'use client';

import { useState, useEffect } from 'react';
import BattleZoneLayout from '@/components/Battle/BattleZoneLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Search,
  Users,
  MessageSquare,
  UserPlus,
  Send,
  ThumbsUp,
  MessageCircle,
  Share,
  MoreHorizontal,
  Filter,
  Trophy,
  Calendar,
  Swords,
} from 'lucide-react';
import { useAxiosGet } from '@/hooks/useAxios';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';

interface User {
  id: string;
  username: string;
  avatar_url?: string;
  bio?: string;
  rank?: number;
  battles_won?: number;
  battles_participated?: number;
  is_online?: boolean;
  is_friend?: boolean;
  last_active?: string;
}

interface Post {
  id: string;
  user: User;
  content: string;
  image_url?: string;
  likes: number;
  comments: number;
  created_at: string;
  has_liked?: boolean;
}

interface Comment {
  id: string;
  user: User;
  content: string;
  created_at: string;
}

export default function CommunityPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [getUsers] = useAxiosGet<User[]>('/api/users');
  const [getPosts] = useAxiosGet<Post[]>('/api/posts');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [usersResponse, postsResponse] = await Promise.all([
          getUsers(),
          getPosts(),
        ]);

        if (usersResponse.data) {
          setUsers(usersResponse.data || []);
        }

        if (postsResponse.data) {
          setPosts(postsResponse.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch community data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter users by search term
  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Render loading state
  if (isLoading) {
    return (
      <BattleZoneLayout>
        <div className="space-y-6">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-4">
              <Skeleton className="h-[400px]" />
            </div>
            <div className="space-y-4 md:col-span-2">
              <Skeleton className="h-[200px]" />
              <Skeleton className="h-[200px]" />
            </div>
          </div>
        </div>
      </BattleZoneLayout>
    );
  }

  return (
    <BattleZoneLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Community</h1>
          <p className="text-muted-foreground">
            Connect with other battle participants and share your experiences
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Left Sidebar - Users */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>Battle Community</CardTitle>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <div className="bg-green-500 h-2 w-2 rounded-full"></div>
                    <span>42 Online</span>
                  </Badge>
                </div>
                <CardDescription>
                  Find and connect with other battlers
                </CardDescription>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs defaultValue="online">
                  <div className="border-b px-6">
                    <TabsList className="w-full justify-start">
                      <TabsTrigger value="online">Online</TabsTrigger>
                      <TabsTrigger value="friends">Friends</TabsTrigger>
                      <TabsTrigger value="top">Top Players</TabsTrigger>
                    </TabsList>
                  </div>

                  <ScrollArea className="h-[400px] px-6 py-4">
                    <TabsContent value="online" className="m-0 space-y-4">
                      {filteredUsers
                        .filter((user) => user.is_online)
                        .map((user) => (
                          <UserListItem key={user.id} user={user} />
                        ))}
                    </TabsContent>

                    <TabsContent value="friends" className="m-0 space-y-4">
                      {filteredUsers
                        .filter((user) => user.is_friend)
                        .map((user) => (
                          <UserListItem key={user.id} user={user} />
                        ))}
                    </TabsContent>

                    <TabsContent value="top" className="m-0 space-y-4">
                      {filteredUsers
                        .toSorted((a, b) => (b.rank || 0) - (a.rank || 0))
                        .slice(0, 10)
                        .map((user) => (
                          <UserListItem key={user.id} user={user} />
                        ))}
                    </TabsContent>
                  </ScrollArea>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>Join these community events</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full text-primary">
                      <Swords className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">Weekend Tournament</h3>
                      <p className="text-sm text-muted-foreground">
                        Saturday, 2pm
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="mt-3 w-full">
                    Join Event
                  </Button>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full text-primary">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">Community Meetup</h3>
                      <p className="text-sm text-muted-foreground">
                        Sunday, 3pm
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="mt-3 w-full">
                    Join Event
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Feed */}
          <div className="space-y-6 md:col-span-2">
            {/* Create Post */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <Avatar>
                    <AvatarImage src="/avatars/01.png" alt="Your Avatar" />
                    <AvatarFallback>YA</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <textarea
                      className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      placeholder="Share your battle experiences..."
                      rows={3}
                    ></textarea>
                    <div className="mt-3 flex justify-between">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Calendar className="mr-2 h-4 w-4" />
                          Event
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trophy className="mr-2 h-4 w-4" />
                          Achievement
                        </Button>
                      </div>
                      <Button size="sm">
                        <Send className="mr-2 h-4 w-4" />
                        Post
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Posts Feed */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Community Feed</h2>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </div>

              {posts.length === 0 ? (
                <Card className="flex flex-col items-center justify-center p-12 text-center">
                  <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-xl font-bold">No Posts Yet</h3>
                  <p className="text-muted-foreground">
                    Be the first to share your battle experiences with the
                    community!
                  </p>
                </Card>
              ) : (
                posts.map((post) => <PostCard key={post.id} post={post} />)
              )}
            </div>
          </div>
        </div>
      </div>
    </BattleZoneLayout>
  );
}

// User List Item Component
function UserListItem({ user }: { user: User }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar>
            <AvatarImage src={user.avatar_url} alt={user.username} />
            <AvatarFallback>
              {user.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {user.is_online && (
            <div className="bg-green-500 absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background"></div>
          )}
        </div>
        <div>
          <div className="font-medium">{user.username}</div>
          {user.rank && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Trophy className="mr-1 h-3 w-3" />
              Rank #{user.rank}
            </div>
          )}
        </div>
      </div>

      <Button variant="ghost" size="icon">
        {user.is_friend ? (
          <MessageSquare className="h-4 w-4" />
        ) : (
          <UserPlus className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

// Post Card Component
function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(post.has_liked || false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  const toggleLike = () => {
    if (liked) {
      setLikesCount(likesCount - 1);
    } else {
      setLikesCount(likesCount + 1);
    }
    setLiked(!liked);
  };

  const toggleComments = async () => {
    setShowComments(!showComments);

    if (!showComments && comments.length === 0) {
      setIsLoadingComments(true);
      // Mock loading comments
      setTimeout(() => {
        setComments([
          {
            id: '1',
            user: {
              id: 'user1',
              username: 'JaneDoe',
              avatar_url: '/avatars/02.png',
            },
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
        ]);
        setIsLoadingComments(false);
      }, 1000);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage
                src={post.user.avatar_url}
                alt={post.user.username}
              />
              <AvatarFallback>
                {post.user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{post.user.username}</div>
              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.created_at), {
                  addSuffix: true,
                })}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
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
        <div className="border-t px-6 py-4">
          <h4 className="mb-4 font-medium">Comments</h4>

          {isLoadingComments ? (
            <div className="space-y-4">
              <Skeleton className="h-[60px]" />
              <Skeleton className="h-[60px]" />
            </div>
          ) : (
            <>
              <div className="mb-4 space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
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
                        <div className="font-medium">
                          {comment.user.username}
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                      <div className="mt-1 flex gap-4 text-xs text-muted-foreground">
                        <Button
                          variant="link"
                          className="h-auto p-0 text-xs text-muted-foreground hover:text-primary"
                        >
                          Like
                        </Button>
                        <Button
                          variant="link"
                          className="h-auto p-0 text-xs text-muted-foreground hover:text-primary"
                        >
                          Reply
                        </Button>
                        <span>
                          {formatDistanceToNow(new Date(comment.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
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
      )}
    </Card>
  );
}
