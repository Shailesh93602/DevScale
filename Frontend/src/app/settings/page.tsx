import type { Metadata } from 'next';
import { ApiKeySettings } from './components/ApiKeySettings';

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Manage your account settings and AI provider key.',
};

/**
 * /settings — the page the profile menu has been pointing at.
 *
 * The menu entry was removed rather than left 404ing (Navbar/constants.tsx);
 * this is the commit that earns it back.
 */
export default function SettingsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage how EduScale works for you.
        </p>
      </header>

      <ApiKeySettings />
    </main>
  );
}
