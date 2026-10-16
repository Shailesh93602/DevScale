/**
 * eduscale-backend#22-07 — GET /articles/:id and /articles/:id/comments are
 * public and returned articles in any status plus the moderation history
 * (moderator notes and usernames) to anyone.
 */
import { describe, it, expect, jest } from '@jest/globals';
import { runHandler } from '../helpers/runHandler';

const articles: Record<string, Record<string, unknown>> = {
  draft: {
    id: 'draft',
    title: 'Unreleased draft',
    status: 'DRAFT',
    author_id: 'author',
    moderations: [{ notes: 'MODERATOR_NOTE', moderator: { username: 'mod1' } }],
  },
  live: {
    id: 'live',
    title: 'Published piece',
    status: 'APPROVED',
    author_id: 'author',
    moderations: [{ notes: 'MODERATOR_NOTE', moderator: { username: 'mod1' } }],
  },
};
jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    article: {
      findUnique: async ({ where }: { where: { id: string } }) =>
        articles[where.id] ?? null,
    },
  },
}));

import ArticleController from '../../controllers/articleController';

const controller = new ArticleController();
const user = (id: string, role = 'STUDENT') =>
  ({ id, role: { id: `r-${role}`, name: role } }) as never;
const get = (id: string, u?: never) =>
  runHandler(controller.getArticleById, { params: { id }, user: u });
const comments = (id: string, u?: never) =>
  runHandler(controller.getArticleComments, { params: { id }, user: u });

describe('article by id', () => {
  it('hides a draft from anonymous callers and other students', async () => {
    for (const u of [undefined, user('stranger')]) {
      const out = await get('draft', u);
      expect(JSON.stringify(out.body)).not.toContain('Unreleased draft');
    }
  });

  it('shows a draft to its author and to moderators', async () => {
    for (const u of [user('author'), user('m', 'MODERATOR')]) {
      const out = await get('draft', u);
      expect(JSON.stringify(out.body)).toContain('Unreleased draft');
    }
  });

  it('serves an approved article publicly without its moderation notes', async () => {
    const out = await get('live');
    const body = JSON.stringify(out.body);
    expect(body).toContain('Published piece');
    expect(body).not.toContain('MODERATOR_NOTE');
  });

  it('keeps /comments (the moderation history) to the author and staff', async () => {
    expect(JSON.stringify((await comments('live')).body)).not.toContain(
      'MODERATOR_NOTE'
    );
    expect(
      JSON.stringify((await comments('live', user('author'))).body)
    ).toContain('MODERATOR_NOTE');
  });
});
