'use client';
import { useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { FAQS } from './faqs';

export default function FAQContent() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Shared with the server page so the FAQPage schema and the rendered
  // questions cannot describe different content. See faqs.ts.
  const faqs = FAQS;

  const handleToggle = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h1 className="mb-6 text-4xl font-bold text-foreground">
          Frequently Asked Questions
        </h1>

        <div className="space-y-3 rounded-lg bg-card p-6 shadow">
          {faqs.map((faq, index) => (
            <div key={faq.id} className="border-b border-border last:border-0">
              <Button
                variant="ghost"
                /* whitespace-normal and a shrink-0 chevron.

                   Button's cva base carries `whitespace-nowrap`, so a long
                   question could not wrap: at 390px "What types of coding
                   challenges are available?" ran off the screen, took the
                   chevron with it, and gave the page 63px of horizontal
                   scroll. components/ui/accordion.tsx already does this
                   correctly — this page just hand-rolls its own accordion.
                   The override works because Button merges classes with cn()
                   (tailwind-merge) rather than concatenating them. */
                className="flex h-auto w-full items-center justify-between gap-3 whitespace-normal rounded-md px-2 py-4 text-left text-lg font-semibold text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
                onClick={() => handleToggle(index)}
                aria-expanded={activeIndex === index}
                aria-controls={`faq-answer-${faq.id}`}
              >
                {faq.question}
                <FiChevronDown
                  className={`h-5 w-5 shrink-0 transition-transform ${
                    activeIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </Button>
              <div
                id={`faq-answer-${faq.id}`}
                role="region"
                className={`overflow-hidden transition-all duration-300 ${
                  activeIndex === index
                    ? 'max-h-96 pb-4 opacity-100'
                    : 'max-h-0 opacity-0'
                }`}
              >
                <p className="px-2 text-muted-foreground">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
