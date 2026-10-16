import { describe, it, expect, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';

// Render the real RootLayout with its providers stubbed to pass-throughs, then
// fire the shadcn toast() that 18 call sites use (battle create/start errors,
// admin user delete, moderation). Before <Toaster /> was mounted these went
// into use-toast's memory store and nothing ever drew them.
const { pass } = vi.hoisted(() => ({
  pass: ({ children }: { children: ReactNode }) => children,
}));
vi.mock('next/font/google', () => ({
  Inter: () => ({ variable: 'inter' }),
  Outfit: () => ({ variable: 'outfit' }),
}));
vi.mock('./App', () => ({ default: pass }));
vi.mock('@/components/ThemeProvider', () => ({ ThemeProvider: pass }));
vi.mock('@/contexts/WebSocketContext', () => ({ WebSocketProvider: pass }));
vi.mock('@/contexts/ReduxContext', () => ({ ReduxProvider: pass }));
vi.mock('@/contexts/AuthContext', () => ({ AuthProvider: pass }));
vi.mock('@/components/Loader', () => ({ default: () => null }));

import RootLayout from './layout';
import { toast } from '@/hooks/use-toast';

describe('RootLayout toasts', () => {
  it('a destructive toast() from hooks/use-toast is visible', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {}); // <html> in a <div>
    render(<RootLayout>page</RootLayout>);
    act(() => {
      toast({
        title: 'Could not start battle',
        description: 'Server said no',
        variant: 'destructive',
      });
    });
    expect(await screen.findByText('Could not start battle')).toBeVisible();
    expect(screen.getByText('Server said no')).toBeVisible();
  });
});
