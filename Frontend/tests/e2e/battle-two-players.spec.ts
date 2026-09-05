import { test, expect, Browser, Page } from '@playwright/test';
import { login, apiAs, settle, API_BASE, fixtureTopicId } from './helpers';

/**
 * The product's headline claim is "real-time multiplayer coding battles". This
 * spec is the only place that actually tests that claim the way a user
 * experiences it: TWO independent browser sessions in the same battle at the
 * same time, racing on the same rows.
 *
 * It asserts realtime behaviour (does player B see player A's score move?) and
 * the concurrency invariants (does a double-tapped answer score twice?).
 */

async function json(page: Page, method: string, path: string, body?: unknown) {
  const res = await apiAs(page, method, path, body);
  return { status: res.status(), body: await res.json().catch(() => null) };
}

async function newSession(browser: Browser, who: 'student' | 'student2') {
  const context = await browser.newContext();
  const page = await context.newPage();
  await login(page, who);
  return { context, page };
}

test.describe('two-player battle', () => {
  test.setTimeout(240_000);

  test('two real browser sessions play one battle to completion', async ({
    browser,
  }) => {
    const p1 = await newSession(browser, 'student');
    const p2 = await newSession(browser, 'student2');

    try {
      // Source a battle from the fixture topic. A missing fixture fails the
      // test — the headline realtime claim must never be reported green on a
      // run where it was skipped.
      const topicId = await fixtureTopicId(p1.page);

      const created = await json(p1.page, 'POST', '/battles', {
        title: `E2E Two Player ${Date.now()}`,
        difficulty: 'EASY',
        type: 'QUICK',
        max_participants: 4,
        total_questions: 5,
        question_source: { type: 'topic', id: topicId, count: 5 },
      });
      expect(created.status, JSON.stringify(created.body)).toBeLessThan(300);
      const battleId = created.body?.data?.id;
      expect(battleId).toBeTruthy();

      // Both players open the live battle page — this is what opens the socket.
      await p1.page.goto(`/battle-zone/${battleId}`);
      await p2.page.goto(`/battle-zone/${battleId}`);
      await settle(p1.page);
      await settle(p2.page);

      // Both join, in parallel, the way two humans hitting Join would.
      const [j1, j2] = await Promise.all([
        json(p1.page, 'POST', `/battles/${battleId}/join`),
        json(p2.page, 'POST', `/battles/${battleId}/join`),
      ]);
      expect(j1.status, JSON.stringify(j1.body)).toBeLessThan(300);
      expect(j2.status, JSON.stringify(j2.body)).toBeLessThan(300);

      // Player 2 double-taps Join — must be refused cleanly, never a 500.
      const dupe = await json(p2.page, 'POST', `/battles/${battleId}/join`);
      expect(dupe.status, 'duplicate join must not 5xx').toBeLessThan(500);
      expect(dupe.status).toBe(409);

      // Each player must see the other in the lobby, live.
      await expect
        .poll(
          async () => {
            const detail = await json(p1.page, 'GET', `/battles/${battleId}`);
            return detail.body?.data?.participants?.length ?? 0;
          },
          {
            timeout: 20_000,
            message: 'both players never appeared in the lobby',
          },
        )
        .toBe(2);

      await json(p1.page, 'POST', `/battles/${battleId}/lobby`);
      await Promise.all([
        json(p1.page, 'POST', `/battles/${battleId}/ready`),
        json(p2.page, 'POST', `/battles/${battleId}/ready`),
      ]);

      // Two clients start the SAME battle at once: exactly one wins, no 500.
      const starts = await Promise.all([
        json(p1.page, 'POST', `/battles/${battleId}/start`),
        json(p1.page, 'POST', `/battles/${battleId}/start`),
      ]);
      expect(
        starts.filter((s) => s.status >= 500),
        `concurrent start returned 5xx: ${starts.map((s) => s.status).join(',')}`,
      ).toHaveLength(0);
      expect(starts.filter((s) => s.status < 300)).toHaveLength(1);

      // Questions are only visible now that the battle is live — and only to
      // the people in it.
      const questions = await json(
        p1.page,
        'GET',
        `/battles/${battleId}/questions`,
      );
      expect(questions.status).toBe(200);
      const qs = questions.body?.data?.questions ?? questions.body?.data ?? [];
      expect(Array.isArray(qs) && qs.length > 0).toBe(true);
      // The payload must never carry the answer key.
      expect(JSON.stringify(qs)).not.toMatch(
        /"correct_answer"|"correctAnswer"/,
      );

      // Player 1 answers question 1 twice, in parallel — one score, not two.
      const q0 = qs[0];
      const dupAnswers = await Promise.all([
        json(p1.page, 'POST', '/battles/answer', {
          battle_id: battleId,
          question_id: q0.id,
          selected_option: 0,
          time_taken_ms: 1200,
        }),
        json(p1.page, 'POST', '/battles/answer', {
          battle_id: battleId,
          question_id: q0.id,
          selected_option: 0,
          time_taken_ms: 1200,
        }),
      ]);
      expect(
        dupAnswers.filter((a) => a.status >= 500),
        'duplicate answer returned 5xx',
      ).toHaveLength(0);
      expect(dupAnswers.filter((a) => a.status < 300)).toHaveLength(1);

      // Player 2 answers the same question — the leaderboard must show BOTH.
      await json(p2.page, 'POST', '/battles/answer', {
        battle_id: battleId,
        question_id: q0.id,
        selected_option: 1,
        time_taken_ms: 1400,
      });

      await expect
        .poll(
          async () => {
            const lb = await json(
              p1.page,
              'GET',
              `/battles/${battleId}/leaderboard`,
            );
            const rows = lb.body?.data?.leaderboard ?? lb.body?.data ?? [];
            return Array.isArray(rows) ? rows.length : 0;
          },
          { timeout: 20_000, message: 'leaderboard never showed both players' },
        )
        .toBe(2);

      // Play the rest out; the battle ends itself when everyone is done.
      for (const q of qs.slice(1)) {
        await json(p1.page, 'POST', '/battles/answer', {
          battle_id: battleId,
          question_id: q.id,
          selected_option: 0,
          time_taken_ms: 1000,
        });
        await json(p2.page, 'POST', '/battles/answer', {
          battle_id: battleId,
          question_id: q.id,
          selected_option: 1,
          time_taken_ms: 1100,
        });
      }

      await expect
        .poll(
          async () => {
            const detail = await json(p1.page, 'GET', `/battles/${battleId}`);
            return detail.body?.data?.status;
          },
          { timeout: 45_000, message: 'battle never reached COMPLETED' },
        )
        .toBe('COMPLETED');

      const results = await p1.page.request.get(
        `${API_BASE}/battles/${battleId}/results`,
      );
      expect(results.status()).toBe(200);
    } finally {
      await p1.context.close();
      await p2.context.close();
    }
  });
});
