import Link from 'next/link';
import { Award, ChevronRight, LogIn, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import RoadmapCard, {
  type RoadmapType,
} from '@/components/Roadmap/RoadmapCard';

/**
 * The signed-out view of /career-roadmap. A server component: the roadmaps
 * are in the HTML. RoadmapCard is a client component (framer-motion), which
 * is fine — it still server-renders, and it carries its own sign-in gate for
 * like/bookmark when there is no session.
 *
 * `null` for either list means the API could not be reached; `[]` means it
 * answered and there is nothing to show. The two get different copy because
 * they are different facts.
 */
interface PublicRoadmapsProps {
  featured: RoadmapType[] | null;
  trending: RoadmapType[] | null;
}

const SIGN_IN_TO_CREATE = '/auth/login?callbackUrl=%2Fcareer-roadmap';

export function PublicRoadmaps({ featured, trending }: PublicRoadmapsProps) {
  const unreachable = featured === null && trending === null;
  const featuredList = featured ?? [];
  // Avoid showing the same roadmap twice when it is both featured and trending.
  const featuredIds = new Set(featuredList.map((r) => r.id));
  const trendingList = (trending ?? []).filter((r) => !featuredIds.has(r.id));
  const empty = !unreachable && featuredList.length + trendingList.length === 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="from-primary/10 relative overflow-hidden bg-gradient-to-b to-background px-6 py-20 sm:py-28 lg:px-8">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="bg-primary/10 absolute -right-40 -top-40 h-80 w-80 rounded-full blur-3xl" />
          <div className="bg-primary/10 absolute -bottom-40 -left-40 h-80 w-80 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-3xl text-center">
          <Badge
            variant="outline"
            className="mb-6 px-4 py-1.5 font-medium text-foreground"
          >
            <Award className="mr-2 h-4 w-4" aria-hidden="true" /> Engineering
            Career Growth
          </Badge>
          <h1 className="bg-gradient-to-br from-foreground to-foreground/80 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-6xl">
            Master Your <span className="text-primary">Engineering Path</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Structured roadmaps you can read right now, without an account. Sign
            in when you want to enrol, track progress, or build your own.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button asChild className="gap-2 px-6 py-6 text-base">
              <Link href={SIGN_IN_TO_CREATE}>
                <LogIn className="h-4 w-4" aria-hidden="true" />
                Sign in to create a roadmap
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="group gap-2 px-6 py-6 text-base"
            >
              <Link href="/career-roadmap/roadmaps">
                Explore all roadmaps
                <ChevronRight
                  className="transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <p className="mt-6 rounded-lg border border-dashed border-border bg-muted/30 p-3 text-center text-sm text-muted-foreground">
          You are browsing as a visitor. Liking, bookmarking, enrolling and
          commenting need an account —{' '}
          <Link href={SIGN_IN_TO_CREATE} className="text-primary underline">
            sign in
          </Link>{' '}
          or{' '}
          <Link href="/auth/register" className="text-primary underline">
            create one
          </Link>
          .
        </p>

        {unreachable && (
          <div className="mt-10 flex h-60 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <Sparkles
              size={48}
              className="mb-4 text-muted-foreground"
              aria-hidden="true"
            />
            <h2 className="mb-2 text-xl font-medium">
              Roadmaps could not be loaded
            </h2>
            <p className="text-muted-foreground">
              The API did not answer. Refresh in a moment — nothing here needs
              an account.
            </p>
          </div>
        )}

        {empty && (
          <div className="mt-10 flex h-60 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <Sparkles
              size={48}
              className="mb-4 text-muted-foreground"
              aria-hidden="true"
            />
            <h2 className="mb-2 text-xl font-medium">No roadmaps yet</h2>
            <p className="text-muted-foreground">
              Nothing has been published so far. This is the real state, not a
              loading screen.
            </p>
          </div>
        )}

        {featuredList.length > 0 && (
          <section className="mt-10" aria-labelledby="featured-roadmaps">
            <h2 id="featured-roadmaps" className="mb-6 text-2xl font-bold">
              Featured Roadmaps
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredList.map((roadmap, index) => (
                <RoadmapCard key={roadmap.id} roadmap={roadmap} index={index} />
              ))}
            </div>
          </section>
        )}

        {trendingList.length > 0 && (
          <section className="mt-12" aria-labelledby="trending-roadmaps">
            <h2 id="trending-roadmaps" className="mb-6 text-2xl font-bold">
              {featuredList.length > 0 ? 'Trending Now' : 'All Roadmaps'}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {trendingList.map((roadmap, index) => (
                <RoadmapCard key={roadmap.id} roadmap={roadmap} index={index} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
