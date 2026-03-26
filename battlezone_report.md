# Battle Zone — Open Risks

> All completed fix history is in `.claude/session-tracker.md`.

| Risk | Severity | Notes |
|------|----------|-------|
| Socket reconnect mid-question resets local timer | Medium | Timer freezes until next `battle:question` event arrives. Fix: local countdown from `ends_at` timestamp. |
| DSA Challenges not yet mappable to MCQ format | Medium | Challenges lack MCQ options. Phase 2 adds `mcq_options`/`mcq_correct_index` to `Challenge` model. |
| Statistics trends show no prior-period comparison | Low | Trend arrows removed. Real implementation needs prior-period query in `getUserStats()`. |
| No per-user question deduplication | Low | Anti-repeat is per-source (same topic/subject in last 30 days), not per-user. |
| `battle.total_questions` vs seeded count can diverge | Low | `addQuestionsFromPool` uses `Math.min(pool.length, count)`. Start guard enforces minimum. |
