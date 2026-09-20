/**
 * The FAQ content, shared by the rendered page and its structured data.
 *
 * This lived inside FAQContent.tsx, a client component, which meant the server
 * page had no way to reach it and /faq shipped with no FAQPage markup at all.
 * Adding a second hand-written copy for the schema is the trap the sibling
 * project fell into: KhataGO's /faq carried ten hand-written schema questions
 * against a page rendering eleven different ones from its locale files — nine
 * of the ten described content no visitor could see, which Google treats as
 * hidden/mismatched structured data and is actionable as spam.
 *
 * One source, imported by both. faqs.test.ts asserts the schema and the page
 * cannot describe different questions.
 */
export interface Faq {
  id: string;
  question: string;
  answer: string;
}

export const FAQS: Faq[] = [
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
    // History, because this answer has now been wrong in both directions.
    // It first read "completely free" while /pricing sold Pro Learner at
    // $29/mo and EduScale Team at $99/mo, so it was corrected to describe the
    // paid plans. Then (2026-09-20) the audit behind
    // docs/PRICING-GROUND-TRUTH.md found those plans were the thing that did
    // not exist: no feature in the product is gated on a tier, and nobody was
    // ever charged. /pricing now sells nothing, so this answer says so. The
    // guard in Frontend/src/lib/no-scale-claims.test.ts holds the two pages
    // together in BOTH directions now, rather than only the one that bit.
    id: 'faq-5',
    question: 'Is there any cost to join?',
    answer:
      'No. EduScale has one tier and it is free: roadmaps, quizzes, coding challenges, battles and the leaderboards are all available to any signed-in account, with no card and no checkout. There are no paid plans to buy today.',
  },
  {
    id: 'faq-6',
    question: 'What is the Battle Zone?',
    answer:
      'The Battle Zone is a competitive coding arena where you can challenge other students in real-time coding battles, test your skills, and climb the leaderboard.',
  },
];

/** FAQPage structured data built from exactly what the page renders. */
export function buildFaqJsonLd(baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${baseUrl}/faq`,
    name: 'EduScale Frequently Asked Questions',
    description: 'Frequently Asked Questions about EduScale.',
    mainEntity: FAQS.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  };
}
