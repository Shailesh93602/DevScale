// A stand-in for the public `GET /api/v1/challenges` so the signed-out
// /coding-challenges page (a server component that fetches during SSR, where
// page.route cannot reach) renders real-shaped cards without any backend.
// Descriptions are the real seed files, so the fixture cannot drift into
// something easier to lay out than production content.
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';

const PORT = Number(process.env.STUB_PORT || 4799);
const seed = (slug) =>
  readFileSync(
    new URL(
      `../../../Backend/resources/challenges/${slug}/description.md`,
      import.meta.url,
    ),
    'utf8',
  );
const challenges = [
  [
    'best-time-buy-sell-fee',
    'Best Time to Buy and Sell Stock with Transaction Fee',
    'MEDIUM',
  ],
  ['find-median-from-data-stream', 'Find Median from Data Stream', 'HARD'],
  [
    'best-time-buy-sell-cooldown',
    'Best Time to Buy and Sell Stock with Cooldown',
    'MEDIUM',
  ],
].map(([id, title, difficulty]) => ({
  id,
  title,
  difficulty,
  description: seed(id),
}));

createServer((req, res) => {
  if (req.url?.startsWith('/api/v1/challenges')) {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(
      JSON.stringify({
        data: challenges,
        meta: {
          total: challenges.length,
          currentPage: 1,
          totalPages: 1,
          limit: 12,
        },
      }),
    );
    return;
  }
  res.writeHead(req.url === '/health' ? 200 : 404).end();
}).listen(PORT);
