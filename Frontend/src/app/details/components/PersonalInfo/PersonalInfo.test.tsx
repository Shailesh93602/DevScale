import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';

const h = vi.hoisted(() => ({ check: vi.fn() }));
vi.mock('@/hooks/useAxios', () => ({ useAxiosGet: () => [h.check, {}] }));

import { PersonalInfo } from './index';

function Harness({ onSubmit }: { onSubmit: (v: unknown) => void }) {
  const methods = useForm({ defaultValues: { username: '' } });
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <PersonalInfo />
        <button type="submit">Save</button>
      </form>
    </FormProvider>
  );
}

describe('PersonalInfo username', () => {
  beforeEach(() => h.check.mockReset());

  it('typing updates the value the form submits', async () => {
    h.check.mockResolvedValue({ success: true, data: { isAvailable: true } });
    const onSubmit = vi.fn();
    render(<Harness onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'grace_h' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ username: 'grace_h' });
  });

  it('a failed availability request is not reported as "not available"', async () => {
    h.check.mockResolvedValue({ success: false, data: null, message: 'x' });
    render(<Harness onSubmit={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'grace_h' },
    });
    expect(
      await screen.findByText('Error checking username', {}, { timeout: 2000 }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Username is not available')).toBeNull();
  });
});
