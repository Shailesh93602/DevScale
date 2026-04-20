import { permanentRedirect } from 'next/navigation';

/**
 * /explore is a legacy path — it was referenced from an older dashboard link
 * but the route was never built as its own page. Rather than serving a 404
 * to anyone who bookmarked it, permanent-redirect to /career-roadmap, which
 * is where "explore learning content" discovery actually lives now.
 */
export default function ExploreRedirect(): never {
  permanentRedirect('/career-roadmap');
}
