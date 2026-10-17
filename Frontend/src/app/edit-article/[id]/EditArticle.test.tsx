import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const h = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
}));
vi.mock('@/hooks/useAxios', () => ({
  useAxiosGet: () => [h.get, {}],
  useAxiosPost: () => [h.post, {}],
}));
vi.mock('react-redux', () => ({ useDispatch: () => vi.fn() }));
vi.mock('react-toastify', () => ({
  toast: { success: h.success, error: h.error },
}));
vi.mock('@/components/Navbar', () => ({ default: () => null }));

import EditArticle from './EditArticle';

describe('EditArticle', () => {
  it('loads the article content and saves the edited text', async () => {
    h.get.mockResolvedValue({
      success: true,
      message: '',
      data: { id: 'a1', content: 'Original body text' },
    });
    h.post.mockResolvedValue({ success: true, message: '', data: null });
    render(<EditArticle id="a1" />);

    const box = await screen.findByLabelText('Article content');
    await waitFor(() => expect(box).toHaveValue('Original body text'));
    expect(h.error).not.toHaveBeenCalled();

    fireEvent.change(box, { target: { value: 'A longer edited body' } });
    fireEvent.click(screen.getByRole('button', { name: 'Update Article' }));
    await waitFor(() =>
      expect(h.post).toHaveBeenCalledWith(
        { content: 'A longer edited body' },
        {},
        { articleId: 'a1' },
      ),
    );
    expect(h.success).toHaveBeenCalled();
  });
});
