import React from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  MessageCircle,
  BookOpen,
  Calendar,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-toastify';
import { useAxiosPost } from '@/hooks/useAxios';

interface FocusCardsProps {
  roadmaps: {
    id: string;
    title: string;
    description?: string;
    enrolledCount?: number;
    author?: string;
    isEnrolled?: boolean;
    comments?: number;
    created_at?: string;
    tags?: string;
  }[];
}

export const FocusCards: React.FC<FocusCardsProps> = ({ roadmaps }) => {
  const [enrollInRoadmap] = useAxiosPost('/roadmaps/enroll');

  // Enroll in roadmap
  const enroll = async (roadmapId: string) => {
    try {
      const response = await enrollInRoadmap({ roadmapId });
      if (response.success) {
        toast.success('Enrolled in roadmap successfully');
      } else {
        toast.error('Error enrolling in roadmap');
      }
    } catch (error: unknown) {
      toast.error('Error enrolling in roadmap');
      console.error((error as { message: string }).message);
    }
  };
  return (
    <>
      {roadmaps?.map((roadmap) => (
        <Card
          key={roadmap?.id}
          className="hover:shadow-primary/5 group relative overflow-hidden border bg-card transition-all hover:shadow-lg"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-muted/10" />

          <CardHeader className="relative space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="text-xl font-semibold transition-colors group-hover:text-primary">
                  {roadmap?.title}
                </h3>
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(roadmap?.created_at ?? '').toLocaleDateString()}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock size={14} />
                    {formatDistanceToNow(new Date(roadmap?.created_at ?? ''), {
                      addSuffix: true,
                    })}
                  </span>
                </p>
              </div>
              <Badge
                variant={roadmap?.isEnrolled ? 'secondary' : 'default'}
                className="ml-2"
              >
                {roadmap?.isEnrolled ? 'Enrolled' : 'Open'}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {roadmap?.tags?.split(',')?.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="bg-primary/5 hover:bg-primary/10"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </CardHeader>

          <CardContent className="relative space-y-4">
            <p className="line-clamp-2 text-muted-foreground">
              {roadmap?.description || 'No description available'}
            </p>

            {roadmap?.isEnrolled && (
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium text-primary">45%</span>
                </div>
                <Progress value={45} className="h-2" />
              </div>
            )}

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Users size={16} className="text-gray-400" />
                  <span>{roadmap?.enrolledCount ?? 0} enrolled</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle size={16} className="text-gray-400" />
                  <span>{roadmap?.comments ?? 0} comments</span>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="relative flex justify-between border-t bg-card/50 pt-4">
            <Button
              variant="ghost"
              size="sm"
              className="hover:text-primary/90 hover:bg-primary/10 text-primary"
              disabled={!roadmap?.id}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Preview
            </Button>
            <Button
              size="sm"
              className="hover:bg-primary/90 bg-primary"
              disabled={!roadmap?.id}
              onClick={() => {
                if (!roadmap?.isEnrolled) {
                  enroll(roadmap?.id);
                }
              }}
            >
              {roadmap?.isEnrolled ? (
                <>
                  Continue <ChevronRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                'Enroll Now'
              )}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </>
  );
};
