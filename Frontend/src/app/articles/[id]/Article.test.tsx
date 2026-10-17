import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const h = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  canModerate: true,
}));
vi.mock('@/hooks/useAxios', () => ({
  useAxiosGet: () => [h.get, {}],
  useAxiosPost: () => [h.post, {}],
}));
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ hasAnyRole: () => h.canModerate }),
}));
vi.mock('@/components/Navbar', () => ({ default: () => null }));
vi.mock('react-toastify', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import Article from './Article';

const article = {
  id: 'a1',
  title: 'Closures',
  author: { username: 'ana' },
  content: '<p>Body</p>',
  created_at: '2026-01-02T00:00:00Z',
  moderations: [
    {
      id: 'm1',
      action: 'FLAG',
      notes: 'Check the second example',
      created_at: '2026-01-03T00:00:00Z',
      moderator: { username: 'mod' },
    },
  ],
};

describe('Article moderation panel', () => {
  beforeEach(() => {
    h.get.mockReset();
    h.post.mockReset();
    h.canModerate = true;
  });

  it('shows the date and existing notes from the API shape', () => {
    render(<Article id="a1" initialData={article} />);
    expect(screen.queryByText('Invalid Date')).toBeNull();
    expect(screen.getByText(/Check the second example/)).toBeInTheDocument();
  });

  it('posts { notes, action } to the article moderation URL', async () => {
    h.post.mockResolvedValue({ success: true, message: '', data: null });
    h.get.mockResolvedValue({ success: true, message: '', data: article });
    render(<Article id="a1" initialData={article} />);
    fireEvent.change(screen.getByLabelText('Action'), {
      target: { value: 'REJECT' },
    });
    fireEvent.change(screen.getByLabelText('Moderation note'), {
      target: { value: 'Plagiarised' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save Note' }));
    await waitFor(() =>
      expect(h.post).toHaveBeenCalledWith(
        { notes: 'Plagiarised', action: 'REJECT' },
        undefined,
        { articleId: 'a1' },
      ),
    );
  });

  it('is hidden from readers who cannot moderate', () => {
    h.canModerate = false;
    render(<Article id="a1" initialData={article} />);
    expect(screen.queryByText('Moderation Notes')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Save Note' })).toBeNull();
  });
});
