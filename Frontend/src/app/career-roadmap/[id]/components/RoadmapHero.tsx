import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RoadmapDetails } from '../page';

interface RoadmapHeroProps {
  roadmapDetails: RoadmapDetails;
}

export const RoadmapHero = ({ roadmapDetails }: RoadmapHeroProps) => {
  const tags = roadmapDetails?.tags ? roadmapDetails.tags.split(',') : [];
  
  return (
    <div className="flex flex-col justify-center space-y-6 rounded-2xl bg-card/60 p-6 backdrop-blur-sm sm:p-8">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Badge
            variant="outline"
            className="border-primary/30 bg-primary/5 text-primary"
          >
            {roadmapDetails.difficulty?.toUpperCase()}
          </Badge>
          {roadmapDetails.isFeatured && (
            <Badge
              variant="secondary"
              className="bg-orange/10 text-orange"
            >
              FEATURED
            </Badge>
          )}
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground break-words sm:text-4xl">
          {roadmapDetails.title}
        </h1>
        <p className="text-lg text-muted-foreground">
          {roadmapDetails.description}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag: string) => (
          <Badge
            key={tag}
            variant="secondary"
            className="bg-muted text-muted-foreground"
          >
            {tag}
          </Badge>
        ))}
      </div>

      <div className="flex items-center space-x-4 rounded-lg bg-card/80 p-4 shadow-sm">
        <Avatar className="ring-primary/10 h-12 w-12 ring-2">
          <AvatarImage
            src={roadmapDetails?.user?.avatar_url || undefined}
          />
          <AvatarFallback className="bg-primary/5 text-primary">
            {(
              roadmapDetails?.user?.full_name?.[0] ||
              roadmapDetails?.user?.username[0]
            )?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-foreground">
            {roadmapDetails?.user?.full_name || roadmapDetails?.user?.username}
          </p>
          <p className="text-sm text-muted-foreground">
            Updated{' '}
            {new Date(
              roadmapDetails.updated_at || roadmapDetails.updatedAt,
            ).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};
