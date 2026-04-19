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
    <div className="min-h-screen bg-black px-4 py-20 text-white">
      <div className="mx-auto mb-16 max-w-7xl text-center">
        <h1 className="from-purple-400 to-pink-600 mb-6 bg-gradient-to-r bg-clip-text text-5xl font-bold text-transparent md:text-7xl">
          Unlock Your Potential with EduScale
        </h1>
        <p className="mx-auto max-w-2xl text-xl text-gray-400">
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
                ? 'from-purple-900/20 border-purple-500/50 bg-gradient-to-b to-black shadow-[0_0_30px_rgba(168,85,247,0.2)]'
                : 'border-white/10 bg-zinc-900/50 hover:border-white/20'
            }`}
          >
            {plan.highlighted && (
              <div className="bg-purple-500 absolute -top-4 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-sm font-bold uppercase tracking-wider text-white">
                Most Popular
              </div>
            )}

            <div className="mb-8">
              <h3 className="mb-2 text-2xl font-bold">{plan.name}</h3>
              <p className="h-10 text-sm text-gray-400">{plan.description}</p>
            </div>

            <div className="mb-8 flex items-baseline gap-1">
              <span className="text-5xl font-bold">{plan.price}</span>
              <span className="text-gray-400">{plan.period}</span>
            </div>

            <ul className="mb-10 space-y-4">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div
                    className={`mt-1 rounded-full p-0.5 ${plan.highlighted ? 'bg-purple-500' : 'bg-gray-600'}`}
                  >
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe(plan)}
              disabled={loading !== null}
              className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-bold transition-all duration-300 ${
                plan.highlighted
                  ? 'from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-purple-500/20 bg-gradient-to-r shadow-lg'
                  : 'bg-white/10 hover:bg-white/20'
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
        <p className="text-sm text-gray-500">
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
