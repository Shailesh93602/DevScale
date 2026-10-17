import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@/hooks/useAxios', () => ({ useAxiosPost: () => [vi.fn(), {}] }));
vi.mock('react-toastify', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

import { CommentItem } from './CommentItem';
import type { Comment } from '@/types';

const make = (id: string, replies: unknown[] = []) =>
  ({
    id,
    content: `comment ${id}`,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    user: { id: 'u', username: 'ana', avatar_url: null },
    _count: { likes: 0, replies: replies.length },
    replies,
  }) as unknown as Comment;

describe('CommentItem reply depth', () => {
  it('offers Reply on a top-level comment but not on a reply', () => {
    render(
      <CommentItem
        comment={make('c1', [make('r1')])}
        roadmapId="rm"
        onCommentUpdate={vi.fn()}
      />,
    );
    expect(screen.getByText('comment r1')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Reply' })).toHaveLength(1);
  });
});
