'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Crown,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Swords,
  Timer,
  Trophy,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  replayStateAt,
  stepCount,
  type BattleFixture,
} from '@/lib/battle-replay';

/**
 * Replays a recorded battle with the same markup the live battle page uses
 * for its question, feedback and leaderboard blocks (battle-zone/[id]/page.tsx
 * renderQuestion / renderLeaderboard / renderCompleted). The live page cannot
 * be reused directly — it is one 1,200-line component that owns its socket,
 * its auth and its API calls — so the visual pieces are mirrored here and
 * driven by a pure replay state instead of events.
 *
 * Playback: auto-play advances one recorded event per tick; the scrubber and
 * the step buttons set the step directly. Nothing here talks to the network.
 */

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];
const TICK_MS = 1600;

interface BattleReplayProps {
  fixture: BattleFixture;
}

export function BattleReplay({ fixture }: BattleReplayProps) {
  const total = stepCount(fixture);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [tab, setTab] = useState<'battle' | 'leaderboard'>('battle');

  const state = useMemo(() => replayStateAt(fixture, step), [fixture, step]);
  const atEnd = step >= total - 1;

  useEffect(() => {
    if (!playing) return;
    if (atEnd) {
      setPlaying(false);
      return;
    }
    const id = setTimeout(
      () => setStep((s) => Math.min(s + 1, total - 1)),
      TICK_MS,
    );
    return () => clearTimeout(id);
  }, [playing, step, atEnd, total]);

  const question =
    state.currentQuestionIndex === null
      ? null
      : fixture.questions[state.currentQuestionIndex];
  const nameOf = (id: string) =>
    fixture.players.find((p) => p.user_id === id)?.username ?? id;

  const togglePlay = () => {
    if (atEnd) {
      setStep(0);
      setPlaying(true);
      return;
    }
    setPlaying((p) => !p);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground">
                Home
              </Link>
              <span aria-hidden="true">/</span>
              <span className="font-medium text-foreground">
                Recorded battle
              </span>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/auth/register">Sign up to play live</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-5xl space-y-6">
          {/* Recording banner — the label lives on the page, not only in a badge */}
          <div
            className="flex flex-col gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 sm:flex-row sm:items-center sm:justify-between"
            role="note"
          >
            <div>
              <p className="font-semibold text-foreground">
                {fixture.label}: this battle was scripted and committed as a
                fixture.
              </p>
              <p className="text-sm text-muted-foreground">
                No socket, no account, no database — the players are not real
                people. It shows the battle UI a member sees when two people
                play live.
              </p>
            </div>
            <Badge
              variant="outline"
              className="w-fit border-amber-500/40 text-amber-700"
            >
              {fixture.label}
            </Badge>
          </div>

          {/* Battle header — mirrors the live page */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                className={
                  state.phase === 'completed'
                    ? 'bg-muted text-muted-foreground'
                    : state.phase === 'in_progress'
                      ? 'border-green-500/20 bg-green-500/10 text-green-500'
                      : 'border-blue-500/20 bg-blue-500/10 text-blue-500'
                }
              >
                {state.phase === 'completed'
                  ? 'Completed'
                  : state.phase === 'in_progress'
                    ? 'In Progress'
                    : 'Waiting'}
              </Badge>
              <Badge variant="outline">{fixture.battle.type}</Badge>
              <Badge variant="outline">{fixture.battle.difficulty}</Badge>
              <Badge
                variant="outline"
                className="border-amber-500/40 text-amber-700"
              >
                {fixture.label}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              {fixture.battle.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Swords className="h-4 w-4" aria-hidden="true" />
                {fixture.players.map((p) => p.username).join(' vs ')}
              </span>
              <span className="flex items-center gap-1.5">
                <Timer className="h-4 w-4" aria-hidden="true" />
                {fixture.battle.total_questions} questions ·{' '}
                {fixture.battle.time_per_question}s each
              </span>
            </div>
          </div>

          <Separator />

          {/* Transport */}
          <div className="space-y-3 rounded-xl border bg-card p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="icon"
                variant="outline"
                onClick={() => {
                  setPlaying(false);
                  setStep(0);
                }}
                aria-label="Restart replay"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={() => {
                  setPlaying(false);
                  setStep((s) => Math.max(0, s - 1));
                }}
                disabled={step === 0}
                aria-label="Previous event"
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button
                onClick={togglePlay}
                className="gap-2"
                aria-label={
                  playing
                    ? 'Pause replay'
                    : atEnd
                      ? 'Replay from start'
                      : 'Play replay'
                }
              >
                {playing ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                {playing ? 'Pause' : atEnd ? 'Replay' : 'Play'}
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={() => {
                  setPlaying(false);
                  setStep((s) => Math.min(total - 1, s + 1));
                }}
                disabled={atEnd}
                aria-label="Next event"
              >
                <SkipForward className="h-4 w-4" />
              </Button>
              <span className="ml-auto text-sm tabular-nums text-muted-foreground">
                Event {step} / {total - 1}
              </span>
            </div>
            <label className="block">
              <span className="sr-only">Replay position</span>
              <input
                type="range"
                min={0}
                max={total - 1}
                value={step}
                onChange={(e) => {
                  setPlaying(false);
                  setStep(Number(e.target.value));
                }}
                className="w-full accent-primary"
                aria-valuetext={state.caption}
              />
            </label>
            <p
              className="text-sm text-muted-foreground"
              aria-live="polite"
              data-testid="replay-caption"
            >
              {state.caption}
            </p>
          </div>

          {/* Tab bar — as on the live page once the battle is under way */}
          {state.phase !== 'idle' && (
            <div className="flex gap-1 rounded-lg border bg-muted/50 p-1">
              {(['battle', 'leaderboard'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors ${tab === t ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {t === 'battle'
                    ? state.phase === 'completed'
                      ? 'Results'
                      : 'Battle'
                    : 'Leaderboard'}
                </button>
              ))}
            </div>
          )}

          {state.phase === 'idle' && (
            <div className="flex flex-col items-center rounded-xl border bg-card py-12 text-center">
              <Swords
                className="mb-4 h-10 w-10 text-muted-foreground"
                aria-hidden="true"
              />
              <h2 className="text-lg font-semibold">Two players are ready</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Press play to watch the recording.
              </p>
            </div>
          )}

          {state.phase === 'in_progress' && tab === 'battle' && question && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline">
                  Question {(state.currentQuestionIndex ?? 0) + 1} /{' '}
                  {fixture.questions.length}
                </Badge>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Timer
                    className="h-4 w-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span>{question.time_limit}s</span>
                </div>
                <Badge variant="secondary">{question.points} pts</Badge>
              </div>

              <div className="rounded-xl border bg-card p-6">
                <p className="text-lg font-semibold leading-relaxed">
                  {question.question}
                </p>
              </div>

              <div className="grid gap-3">
                {question.options.map((option, idx) => {
                  const pickedBy = state.answers
                    .filter((a) => a.option === idx)
                    .map((a) => nameOf(a.user_id));
                  const isCorrect =
                    state.revealed && idx === question.correct_answer;
                  const isWrong =
                    state.revealed &&
                    pickedBy.length > 0 &&
                    idx !== question.correct_answer;
                  return (
                    <div
                      key={idx}
                      className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all ${isCorrect ? 'border-green-500 bg-green-500/10 text-green-700' : ''} ${isWrong ? 'border-destructive bg-destructive/10 text-destructive' : ''} ${!state.revealed && pickedBy.length > 0 ? 'bg-primary/10 border-primary' : ''}`}
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${isCorrect ? 'border-green-500 bg-green-500 text-white' : ''} ${isWrong ? 'border-destructive bg-destructive text-white' : ''} ${!isCorrect && !isWrong ? 'border-muted-foreground/30' : ''}`}
                      >
                        {OPTION_LETTERS[idx]}
                      </span>
                      <span className="flex-1">{option}</span>
                      {pickedBy.length > 0 && (
                        <span className="flex flex-wrap justify-end gap-1">
                          {pickedBy.map((name) => (
                            <Badge key={name} variant="secondary">
                              {name}
                            </Badge>
                          ))}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {state.revealed && (
                <div className="space-y-2">
                  {state.answers.map((a) => (
                    <div
                      key={a.user_id}
                      className={`rounded-xl border p-4 ${a.is_correct ? 'border-green-500/30 bg-green-500/5' : 'border-destructive/30 bg-destructive/5'}`}
                    >
                      <p
                        className={`font-semibold ${a.is_correct ? 'text-green-600' : 'text-destructive'}`}
                      >
                        {nameOf(a.user_id)}:{' '}
                        {a.is_correct
                          ? `✓ Correct! +${a.points_earned} points`
                          : '✗ Incorrect — 0 points'}{' '}
                        <span className="font-normal text-muted-foreground">
                          ({(a.time_taken_ms / 1000).toFixed(1)}s)
                        </span>
                      </p>
                    </div>
                  ))}
                  {question.explanation && (
                    <p className="rounded-xl border p-4 text-sm text-muted-foreground">
                      {question.explanation}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {state.phase === 'completed' && tab === 'battle' && (
            <div className="space-y-6">
              <div className="space-y-3 rounded-xl border bg-card p-8 text-center">
                <Crown
                  className="text-yellow-500 mx-auto h-14 w-14"
                  aria-hidden="true"
                />
                <h2 className="text-2xl font-bold">
                  {state.winnerId
                    ? `${nameOf(state.winnerId)} wins`
                    : 'Battle Complete'}
                </h2>
                <p className="text-muted-foreground">
                  Final results of the recording.
                </p>
              </div>
              <Standings state={state} />
              <div className="flex flex-col items-center gap-3 rounded-xl border bg-card p-6 text-center">
                <CheckCircle2
                  className="text-green-500 h-8 w-8"
                  aria-hidden="true"
                />
                <p className="text-sm text-muted-foreground">
                  In a live battle this is where you would see your own
                  per-question breakdown and rating change.
                </p>
                <Button asChild>
                  <Link href="/auth/register">Create an account to play</Link>
                </Button>
              </div>
            </div>
          )}

          {state.phase !== 'idle' && tab === 'leaderboard' && (
            <Standings state={state} />
          )}
        </div>
      </div>
    </div>
  );
}

function Standings({ state }: { state: ReturnType<typeof replayStateAt> }) {
  if (state.leaderboard.every((e) => e.score === 0)) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <Trophy
          className="mb-3 h-10 w-10 text-muted-foreground"
          aria-hidden="true"
        />
        <p className="text-muted-foreground">No scores yet</p>
      </div>
    );
  }
  return (
    <ol className="space-y-3" aria-label="Standings">
      {state.leaderboard.map((entry, i) => (
        <li
          key={entry.user_id}
          className={`flex items-center gap-3 rounded-lg border p-4 ${i === 0 && entry.score > 0 ? 'border-yellow-500/30' : ''}`}
        >
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${i === 0 && entry.score > 0 ? 'bg-yellow-500 text-white' : i === 1 && entry.score > 0 ? 'bg-gray-400 text-white' : 'bg-muted text-muted-foreground'}`}
          >
            {i + 1}
          </span>
          <Avatar className="h-8 w-8">
            <AvatarFallback>{entry.username[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-medium">{entry.username}</p>
            <p className="text-xs text-muted-foreground">
              {entry.correct_count} correct ·{' '}
              {(entry.total_time_ms / 1000).toFixed(1)}s total
            </p>
          </div>
          <span className="font-bold">{entry.score} pts</span>
        </li>
      ))}
    </ol>
  );
}
