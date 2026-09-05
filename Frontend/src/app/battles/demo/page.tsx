import type { Metadata } from 'next';
import fixtureJson from '@/data/demo-battle.json';
import { validateFixture, type BattleFixture } from '@/lib/battle-replay';
import { BattleReplay } from './BattleReplay';

/**
 * /battles/demo — a recorded two-player battle, replayed from a committed
 * fixture. Public, static, no socket, no account, no writes.
 *
 * WHY THIS EXISTS. The Battle Zone is the most interesting part of the
 * product and the one part a visitor could not see: every route under it is
 * auth-gated and needs a second live player. A recruiter with five minutes
 * saw a login wall. This page shows the real battle UI driving a scripted
 * timeline — labelled as a recording on the page, in the fixture, and in the
 * page title, so nobody mistakes it for live play.
 */

export const metadata: Metadata = {
  title: 'Recorded Battle Demo',
  description:
    'Watch a recorded two-player coding battle replay — the live Battle Zone UI, no account needed.',
  alternates: { canonical: '/battles/demo' },
};

const fixture = fixtureJson as unknown as BattleFixture;

// Fail at build/dev time, loudly, if the fixture was edited into a lie.
// (validateFixture is also unit-tested against this exact file.)
const problems = validateFixture(fixture);
if (problems.length > 0) {
  throw new Error(`demo-battle.json is inconsistent:\n${problems.join('\n')}`);
}

export default function BattleDemoPage() {
  return <BattleReplay fixture={fixture} />;
}
