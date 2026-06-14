'use client';

import React from 'react';
import { Check, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
  priceId?: string;
}

const plans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free Tier',
    price: '$0',
    period: '/ mo',
    description: 'Perfect for beginners starting their coding journey.',
    features: [
      'Access to 25+ Intro Courses',
      'Community Forum Access',
      'Basic Code Editor',
      'Public Portfolio Builder',
      '1 Concurrent Battle',
    ],
    cta: 'Start Coding',
  },
  {
    id: 'pro',
    name: 'Pro Learner',
    price: '$29',
    period: '/ mo',
    description: 'Accelerate your career with advanced paths and mentorship.',
    features: [
      'Full Course Library (500+)',
      'Advanced Learning Paths',
      '1-on-1 Mentor Sessions (2/mo)',
      'Private Code Reviews',
      'Verified Certifications',
      'Priority Support',
    ],
    cta: 'Upgrade to Pro',
    highlighted: true,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
  },
  {
    id: 'team',
    name: 'EduScale Team',
    price: '$99',
    period: '/ user / mo',
    description: 'The ultimate tool for engineering teams and bootcamps.',
    features: [
      'Organization Dashboard',
      'Team Management Tools',
      'Dedicated Account Manager',
      'Tailored Training Paths',
      'SLA & API Access',
      'Enterprise Integrations',
    ],
    cta: 'Contact Sales',
    priceId: process.env.NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID,
  },
];

export default function PricingPage() {
  const [loading, setLoading] = React.useState<string | null>(null);

  const handleSubscribe = async (plan: PricingPlan) => {
    if (plan.id === 'free') {
      window.location.href = '/dashboard';
      return;
    }

    if (plan.id === 'team') {
      window.location.href = 'mailto:sales@eduscale.com';
      return;
    }

    setLoading(plan.id);
    try {
      const { data } = await axios.post('/api/v1/billing/checkout', {
        priceId: plan.priceId,
      });
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      toast.error(msg || 'Failed to start checkout');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-20 text-foreground">
      <div className="mx-auto mb-16 max-w-7xl text-center">
        <h1 className="mb-6 text-5xl font-bold text-foreground md:text-7xl">
          Unlock Your Potential with EduScale
        </h1>
        <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
          Flexible plans to elevate your coding skills and career. Choose the
          one that fits your goals.
        </p>
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative transform rounded-3xl border p-8 transition-all duration-300 hover:-translate-y-2 ${
              plan.highlighted
                ? 'border-primary/50 bg-card shadow-[0_0_30px_hsl(var(--primary)/0.18)] ring-1 ring-primary/30'
                : 'border-border bg-card hover:border-primary/30'
            }`}
          >
            {plan.highlighted && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-sm font-bold uppercase tracking-wider text-primary-foreground">
                Most Popular
              </div>
            )}

            <div className="mb-8">
              <h3 className="mb-2 text-2xl font-bold">{plan.name}</h3>
              <p className="h-10 text-sm text-muted-foreground">{plan.description}</p>
            </div>

            <div className="mb-8 flex items-baseline gap-1">
              <span className="text-5xl font-bold">{plan.price}</span>
              <span className="text-muted-foreground">{plan.period}</span>
            </div>

            <ul className="mb-10 space-y-4">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div
                    className={`mt-1 rounded-full p-0.5 ${plan.highlighted ? 'bg-primary' : 'bg-muted-foreground/40'}`}
                  >
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                  <span className="text-sm text-foreground/80">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe(plan)}
              disabled={loading !== null}
              className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-bold transition-all duration-300 ${
                plan.highlighted
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90'
                  : 'bg-muted text-foreground hover:bg-muted/70'
              } disabled:opacity-50`}
            >
              {loading === plan.id ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                plan.cta
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-24 text-center">
        <p className="text-sm text-muted-foreground">
          Trusted by engineers at top companies worldwide.
          <span className="mt-4 block space-x-8 opacity-50 grayscale">
            <span className="text-xl font-bold">Google</span>
            <span className="text-xl font-bold">GitHub</span>
            <span className="text-xl font-bold">Stripe</span>
            <span className="text-xl font-bold">Microsoft</span>
          </span>
        </p>
      </div>
    </div>
  );
}
