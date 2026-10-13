import { Calendar, Filter, MessageSquare, Send, Trophy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { PostCard } from './PostCard';
import type { Post } from './communityTypes';

function CreatePostCard() {
  return (
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
  );
}

export function CommunityFeed({ posts }: { posts: Post[] }) {
  return (
    <div className="space-y-6 md:col-span-2">
      <CreatePostCard />

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
              Be the first to share your battle experiences with the community!
            </p>
          </Card>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
}
