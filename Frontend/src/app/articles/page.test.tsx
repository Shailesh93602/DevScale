import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const h = vi.hoisted(() => ({ get: vi.fn(), error: vi.fn() }));
vi.mock('@/hooks/useAxios', () => ({ useAxiosGet: () => [h.get, {}] }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('react-toastify', () => ({ toast: { error: h.error } }));

import MyArticles from './page';

describe('MyArticles', () => {
  it('renders the articles from the real envelope (data is the array)', async () => {
    h.get.mockResolvedValue({
      success: true,
      message: 'ok',
      data: [{ id: 'a1', title: 'Closures explained', status: 'APPROVED' }],
    });
    render(<MyArticles />);
    expect(await screen.findByText('Closures explained')).toBeInTheDocument();
    expect(h.error).not.toHaveBeenCalled();
  });
});
