import { Award, ChevronRight, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function RoadmapHero({
  onCreate,
  onExplore,
}: {
  onCreate: () => void;
  onExplore: () => void;
}) {
  return (
    <div className="from-primary/10 relative overflow-hidden bg-gradient-to-b to-background px-6 py-20 sm:py-28 lg:px-8">
      <div className="shadow-primary/10 ring-primary/10 absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-background/10 shadow-xl ring-1" />

      {/* Decorative elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="bg-primary/10 absolute -right-40 -top-40 h-80 w-80 rounded-full blur-3xl" />
        <div className="bg-primary/10 absolute -bottom-40 -left-40 h-80 w-80 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-3xl text-center">
        <div>
          <Badge
            variant="outline"
            className="mb-6 px-4 py-1.5 font-medium text-foreground"
          >
            <Award className="mr-2 h-4 w-4" /> Engineering Career Growth
          </Badge>
          <h1 className="bg-gradient-to-br from-foreground to-foreground/80 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-6xl">
            Master Your <span className="text-primary">Engineering Path</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Expert-curated roadmaps to guide your engineering journey. Start,
            track, and achieve your career goals with step-by-step guidance from
            industry professionals.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button
              className="group flex items-center gap-2 px-6 py-6 text-base"
              onClick={onCreate}
            >
              <Plus size={18} /> Create Roadmap
            </Button>
            <Button
              className="group flex items-center gap-2 px-6 py-6 text-base"
              onClick={onExplore}
            >
              Explore Popular Paths
              <ChevronRight className="transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
