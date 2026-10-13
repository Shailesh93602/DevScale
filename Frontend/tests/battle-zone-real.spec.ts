/**
 * battle-zone-real.spec.ts
 *
 * Real end-to-end tests for the Battle Zone — no mocks, no fakes.
 * Every test hits the live frontend (baseURL from playwright.config.ts) and
 * the live backend the app is built against (NEXT_PUBLIC_API_BASE_URL).
 * Two real Supabase accounts are used for multi-user flows.
 *
 * Accounts (passwords come from E2E_*_PASSWORD — see tests/utils/testUsers.ts):
 *   Player 1 (creator):  testuser@yopmail.com
 *   Player 2 (joiner):   battleplayer2@yopmail.com
 *
 * Prerequisites:
 *   - npm run seed:battles   (in Backend) — ensures 5 WAITING battles exist
 *   - Backend running at NEXT_PUBLIC_API_BASE_URL (export it for this process
 *     too; the default is localhost:4000)
 *   - Frontend running at the configured baseURL
 *
 * NOTHING HERE IS CONDITIONAL ON WHAT THE PAGE HAPPENS TO SHOW. This file used
 * to wrap most of its steps in `if (await x.isVisible().catch(() => false))`
 * with a console.log in the else branch, and every test in a serial chain
 * opened with `if (!battleId) { test.skip(); return; }`. Against the local e2e
 * database, 24 of its 79 tests skipped and the rest passed while the lobby
 * never opened, no answer was ever submitted and no battle ever completed.
 * Every control a step needs is now asserted to exist, every API call a step
 * makes is asserted to succeed, and a broken previous step fails the chain
 * instead of skipping it. src/test/playwright-silent-skip.test.ts keeps it so.
 */

import {
  registerBattleListFlow,
  registerFiltersFlow,
  registerListStateFlow,
} from './battle-zone-real/list.steps';
import {
  registerDetailFlow,
  registerJoinLeaveFlow,
} from './battle-zone-real/detail.steps';
import { registerCreateWizardFlow } from './battle-zone-real/create-wizard.steps';
import { registerMultiplayerFlow } from './battle-zone-real/multiplayer.steps';
import {
  registerMyBattlesFlow,
  registerStatisticsFlow,
  registerLayoutFlow,
} from './battle-zone-real/pages.steps';
import { registerCancelFlow } from './battle-zone-real/cancel.steps';
import { registerGameplayFlow } from './battle-zone-real/gameplay.steps';

// Registered in the original order: the serial flows share database state.
registerBattleListFlow();
registerFiltersFlow();
registerDetailFlow();
registerJoinLeaveFlow();
registerCreateWizardFlow();
registerMultiplayerFlow();
registerMyBattlesFlow();
registerStatisticsFlow();
registerLayoutFlow();
registerCancelFlow();
registerGameplayFlow();
registerListStateFlow();
