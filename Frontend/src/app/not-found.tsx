import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-xl flex-col items-center justify-center px-6 py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-primary">
        404
      </p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
        Page not found
      </h1>
      <p className="mt-4 text-muted-foreground">
        We couldn&apos;t find the page you were looking for. It may have been
        moved, renamed, or never existed.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link href="/">Go home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/career-roadmap">Browse roadmaps</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/battle-zone">Battle Zone</Link>
        </Button>
      </div>
    </div>
  );
}
