import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const h = vi.hoisted(() => ({ post: vi.fn(), success: vi.fn() }));
vi.mock('@/hooks/useAxios', () => ({ useAxiosPost: () => [h.post, {}] }));
vi.mock('react-redux', () => ({ useDispatch: () => vi.fn() }));
vi.mock('react-toastify', () => ({
  toast: { success: h.success, error: vi.fn() },
}));
vi.mock('@/components/Navbar', () => ({ default: () => null }));

import CreateResource from './CreateResource';

describe('CreateResource', () => {
  it('saves what the user typed and reads success from the envelope', async () => {
    h.post.mockResolvedValue({ success: true, message: '', data: null });
    render(<CreateResource id="r1" />);
    fireEvent.change(screen.getByLabelText('Resource content'), {
      target: { value: 'Notes on recursion' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save Resource' }));
    await waitFor(() =>
      expect(h.post).toHaveBeenCalledWith(
        { content: 'Notes on recursion' },
        {},
        { resourceId: 'r1' },
      ),
    );
    expect(h.success).toHaveBeenCalled();
  });
});
