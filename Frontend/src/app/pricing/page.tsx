'use client';

import React from 'react';
import { Check, Minus } from 'lucide-react';
import { BRANDING } from '@/constants';

/**
 * WHAT THIS PAGE USED TO SAY, AND WHY IT DOESN'T ANY MORE.
 *
 * It sold "Pro Learner" at $29/mo on six features and "EduScale Team" at
 * $99/user/mo on six more. Of those twelve, one existed — AI code review —
 * and it is free to every signed-in user. There is no course table with rows
 * in it, no mentorship route, no Certificate code path, no Organization
 * model, no API key issuance and no SLA. `requirePro` and `requireTeam` are
 * implemented, tested, and applied to ZERO routes: nothing in this product
 * has ever been gated on a subscription tier.
 *
 * Nobody was ever charged — the Stripe price ids are unset in production, and
 * the button posted to the frontend origin where no such route exists — but
 * "the checkout was broken" is not a defence for the copy. The page was
 * false whether or not it worked.
 *
 * The billing backend (Backend/src/routes/subscriptionRoutes.ts) is left in
 * place. It is the checkout CALL that is gone, because there is nothing to
 * sell. docs/PRICING-GROUND-TRUTH.md records, per tier, what would have to be
 * built for each cut line to come back.
 */

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  /** Shipped and usable today. Rendered with a check. */
  features: string[];
  /** Named so the intent isn't lost, rendered as explicitly absent. */
  absentFeatures?: string[];
  cta: string;
  /** false → there is nothing to buy; the button does not pretend otherwise. */
  available: boolean;
  highlighted?: boolean;
}

const plans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: '',
    description:
      'The only tier. Every signed-in account gets all of it, with no card and no checkout.',
    features: [
      'Public career roadmaps with per-topic quizzes',
      'Coding challenges in an in-browser editor',
      'Submissions run in a sandboxed code runner',
      'AI review of your own challenge submissions',
      'Real-time coding battles, matchmaking and leaderboards',
      'Progress tracking, streaks and achievement badges',
      'Articles, blogs and curated learning resources',
    ],
    cta: 'Start Coding',
    available: true,
    highlighted: true,
  },
  {
    id: 'paid',
    name: 'Paid plans',
    price: '—',
    period: '',
    description:
      'Not available yet. Nothing in EduScale is behind a paywall, and there is no checkout to complete.',
    features: [],
    absentFeatures: [
      'Team and organisation accounts — not built',
      'Mentor sessions — not built',
      'Certificates — not built',
      'A public API and a support commitment — not built',
    ],
    cta: 'Not available yet',
    available: false,
  },
];

export default function PricingPage() {
  const handleSelect = (plan: PricingPlan) => {
    if (plan.id === 'free') {
      window.location.href = '/dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-20 text-foreground">
      <div className="mx-auto mb-16 max-w-7xl text-center">
        <h1 className="mb-6 text-5xl font-bold text-foreground md:text-7xl">
          Pricing
        </h1>
        <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
          EduScale is free. There is one tier, everyone gets all of it, and
          there is nothing to buy.
        </p>
      </div>

      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative transform rounded-3xl border p-8 transition-all duration-300 ${
              plan.highlighted
                ? 'border-primary/50 ring-primary/30 bg-card shadow-[0_0_30px_hsl(var(--primary)/0.18)] ring-1 hover:-translate-y-2'
                : 'border-border bg-card opacity-80'
            }`}
          >
            <div className="mb-8">
              <h3 className="mb-2 text-2xl font-bold">{plan.name}</h3>
              <p className="min-h-16 text-sm text-muted-foreground">
                {plan.description}
              </p>
            </div>

            <div className="mb-8 flex items-baseline gap-1">
              <span className="text-5xl font-bold">{plan.price}</span>
              {plan.period && (
                <span className="text-muted-foreground">{plan.period}</span>
              )}
            </div>

            <ul className="mb-10 space-y-4">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <div className="mt-1 rounded-full bg-primary p-0.5">
                    <Check
                      className="h-3 w-3 text-primary-foreground"
                      aria-hidden="true"
                    />
                  </div>
                  <span className="text-sm text-foreground/80">{feature}</span>
                </li>
              ))}
              {plan.absentFeatures?.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <div className="mt-1 rounded-full bg-muted-foreground/30 p-0.5">
                    <Minus
                      className="h-3 w-3 text-muted-foreground"
                      aria-hidden="true"
                    />
                  </div>
                  <span className="text-sm text-muted-foreground line-through decoration-muted-foreground/40">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => handleSelect(plan)}
              disabled={!plan.available}
              aria-disabled={!plan.available}
              className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-bold transition-all duration-300 ${
                plan.available
                  ? 'shadow-primary/20 hover:bg-primary/90 bg-primary text-primary-foreground shadow-lg'
                  : 'cursor-not-allowed bg-muted text-muted-foreground'
              }`}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-24 max-w-2xl text-center">
        <p className="text-sm text-muted-foreground">
          Every line above is in the shipped code today — nothing on this page
          is a plan or a projection. Real-time battles, career roadmaps and a
          sandboxed code runner, on Next.js, PostgreSQL and Redis.
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          Want something here that isn&apos;t built?{' '}
          <a
            className="underline underline-offset-4 hover:text-foreground"
            href={`mailto:${BRANDING.contactEmail}`}
          >
            {BRANDING.contactEmail}
          </a>
        </p>
      </div>
    </div>
  );
}
