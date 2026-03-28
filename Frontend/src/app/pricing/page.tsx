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
      '1 Concurrent Battle'
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
      'Priority Support'
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
      'Enterprise Integrations'
    ],
    cta: 'Contact Sales',
    priceId: process.env.NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID,
  }
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
        priceId: plan.priceId
      });
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to start checkout');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white py-20 px-4">
      <div className="max-w-7xl mx-auto text-center mb-16">
        <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 mb-6">
          Unlock Your Potential with EduScale
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Flexible plans to elevate your coding skills and career. Choose the one that fits your goals.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-3xl p-8 transition-all duration-300 transform hover:-translate-y-2 border ${
              plan.highlighted
                ? 'bg-gradient-to-b from-purple-900/20 to-black border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.2)]'
                : 'bg-zinc-900/50 border-white/10 hover:border-white/20'
            }`}
          >
            {plan.highlighted && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-sm font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                Most Popular
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-gray-400 text-sm h-10">{plan.description}</p>
            </div>

            <div className="mb-8 flex items-baseline gap-1">
              <span className="text-5xl font-bold">{plan.price}</span>
              <span className="text-gray-400">{plan.period}</span>
            </div>

            <ul className="space-y-4 mb-10">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className={`mt-1 p-0.5 rounded-full ${plan.highlighted ? 'bg-purple-500' : 'bg-gray-600'}`}>
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe(plan)}
              disabled={loading !== null}
              className={`w-full py-4 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                plan.highlighted
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/20'
                  : 'bg-white/10 hover:bg-white/20'
              } disabled:opacity-50`}
            >
              {loading === plan.id ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                plan.cta
              )}
            </button>
          </div>
        ))}
      </div>
      
      <div className="mt-24 text-center">
        <p className="text-gray-500 text-sm">
          Trusted by engineers at top companies worldwide. 
          <span className="block mt-4 opacity-50 space-x-8 grayscale">
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
