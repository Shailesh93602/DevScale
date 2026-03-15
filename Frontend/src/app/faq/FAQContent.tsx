'use client';
import { useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import { Button } from '@/components/ui/button';

export default function FAQContent() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const faqs = [
    {
      id: 'faq-1',
      question: 'What is EduScale?',
      answer:
        'EduScale is an all-in-one platform for engineering students. It provides personalized roadmaps, coding challenges, community support, placement preparation, and interactive learning tools to help you succeed.',
    },
    {
      id: 'faq-2',
      question: 'How can I join the community?',
      answer:
        'You can join the community by signing up for a free account and participating in forums, events, and collaboration opportunities.',
    },
    {
      id: 'faq-3',
      question: 'What types of coding challenges are available?',
      answer:
        'We offer a variety of coding challenges ranging from beginner to advanced levels across different programming languages including JavaScript, Python, Java, and more.',
    },
    {
      id: 'faq-4',
      question: 'How can I track my progress?',
      answer:
        'You can track your progress through your dashboard where all your activities, completed challenges, streaks, and achievements are displayed.',
    },
    {
      id: 'faq-5',
      question: 'Is there any cost to join?',
      answer:
        'No, joining the community and accessing the core resources on EduScale is completely free.',
    },
    {
      id: 'faq-6',
      question: 'What is the Battle Zone?',
      answer:
        'The Battle Zone is a competitive coding arena where you can challenge other students in real-time coding battles, test your skills, and climb the leaderboard.',
    },
  ];

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
                className="flex h-auto w-full items-center justify-between rounded-md px-2 py-4 text-left text-lg font-semibold text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
                onClick={() => handleToggle(index)}
                aria-expanded={activeIndex === index}
                aria-controls={`faq-answer-${faq.id}`}
              >
                {faq.question}
                <FiChevronDown
                  className={`h-5 w-5 transition-transform ${
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
