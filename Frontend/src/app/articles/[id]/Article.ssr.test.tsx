// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';
import { renderToString } from 'react-dom/server';

vi.mock('@/hooks/useAxios', () => ({
  useAxiosGet: () => [vi.fn(), {}],
  useAxiosPost: () => [vi.fn(), {}],
}));
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ hasAnyRole: () => false }),
}));
vi.mock('@/components/Navbar', () => ({ default: () => null }));
vi.mock('react-toastify', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import Article from './Article';

describe('Article SSR', () => {
  it('does not put unsanitised article HTML into the server response', () => {
    const html = renderToString(
      <Article
        id="a1"
        initialData={{
          id: 'a1',
          title: 'T',
          author: { username: 'u' },
          content: '<img src=x onerror="alert(1)">',
          created_at: '2026-01-02T00:00:00Z',
        }}
      />,
    );
    expect(html).not.toContain('onerror');
  });
});
