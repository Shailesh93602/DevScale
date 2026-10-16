import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const postRoadmap = vi.fn();
vi.mock('@/hooks/useAxios', () => ({
  useAxiosGet: () => [vi.fn(), {}],
  useAxiosPost: () => [postRoadmap, {}],
}));
const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock('react-toastify', () => ({ toast }));

import { useCreateRoadmapForm } from './useCreateRoadmapForm';
import { ROADMAP_FORM_DEFAULTS } from './roadmapFormSchema';

const values = {
  ...ROADMAP_FORM_DEFAULTS,
  title: 'Backend roadmap',
  description: 'A roadmap long enough to pass the schema.',
};

function setup() {
  const onClose = vi.fn();
  const onSuccess = vi.fn();
  const { result } = renderHook(() =>
    useCreateRoadmapForm({ isOpen: false, onClose, onSuccess }),
  );
  return { result, onClose, onSuccess };
}

describe('useCreateRoadmapForm.onSubmit', () => {
  beforeEach(() => {
    postRoadmap.mockReset();
    toast.success.mockReset();
    toast.error.mockReset();
  });

  it('a 400 shows the error and keeps the modal open (useAxiosPost never throws)', async () => {
    postRoadmap.mockResolvedValue({
      success: false,
      error: true,
      data: null,
      message: 'Title is required',
    });
    const { result, onClose, onSuccess } = setup();
    await act(() => result.current.onSubmit(values));
    expect(toast.success).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('Title is required');
    expect(onSuccess).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('sends the fields at the top level and announces success once (via onSuccess)', async () => {
    postRoadmap.mockResolvedValue({ success: true, data: {}, message: 'ok' });
    const { result, onClose, onSuccess } = setup();
    await act(() => result.current.onSubmit(values));
    expect(postRoadmap).toHaveBeenCalledWith(values);
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(toast.success).not.toHaveBeenCalled();
  });
});
