# Battle Zone — Remaining Work

> Completed work is in `.claude/session-tracker.md`. This file tracks only **open** items.

---

## Open Items

### ~~P5.14 — Post-battle results page enrichment~~ ✅ DONE (2026-03-24)
- `GET /battles/:id/my-results` returns per-question breakdown with community accuracy
- `[id]/page.tsx` renders full question breakdown in COMPLETED state

### P5.15 — Statistics: topic attribution from question sources
- If `source_quiz_question_id` is set on `BattleQuestion`, join → `QuizQuestion` → `Quiz` → `Topic`
- `getUserStats()` returns `top_topics[]` with real per-question topic data (not just `battle.topic_id`)
- "Strongest/Weakest topic" based on per-question accuracy over time

### P5.16 — DSA Challenge MCQ conversion (Phase 2)
- Add `mcq_options: Json?` and `mcq_correct_index: Int?` to `Challenge` schema
- Phase 1: DSA mode in `QuestionSourceSelector` currently has category/difficulty UI but no backend pool
- Blocked until MCQ fields exist on `Challenge` model

---

## Known Risks (carry forward)

| Risk | Severity |
|------|----------|
| `battle.total_questions` vs actual seeded count can diverge | Low |
| Socket reconnect mid-question resets local timer until next `battle:question` | Medium |
| DSA Challenges not mappable to MCQ yet | Medium |
| Statistics trends shown as static "—" (no real prior-period comparison) | Low |
| No per-user question deduplication (anti-repeat is per-source only) | Low |

---

## Validation Checklist (all other items ✅)

- [x] Battle creation with questions works end-to-end
- [x] Battle cannot start without questions (server-side guard)
- [x] Server-side time validation on answers (2s grace period)
- [x] Socket cleanup on unmount
- [x] Statistics page shows real data with timeframe filter
- [x] Statistics trend values removed (no fake data)
- [x] View All / Download buttons wired or disabled appropriately
- [x] 5-type seeder covers topic/subject/main_concept/roadmap/practice
- [x] TypeScript: 0 errors frontend + backend
- [x] Backend tests: 40/40 passing
- [ ] P5.14 Post-battle results breakdown
- [ ] P5.15 Topic attribution in statistics from question sources
- [ ] P5.16 DSA Challenge MCQ (Phase 2)
