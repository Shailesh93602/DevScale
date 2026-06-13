'use client';
import React from 'react';
import { ComingSoon } from '@/components/ui/coming-soon';

// The Doubts Corner is deferred until it is wired to the real
// community/forum backend. The previous version faked submission (it only
// showed a success toast and discarded the question), so it has been replaced
// with an honest Coming Soon. See DEFERRED_FEATURES.md.
const DoubtsContent = () => {
  return (
    <div className="container mx-auto py-20">
      <ComingSoon
        title="Doubts Corner"
        description="Ask engineering and programming questions and get answers from the community. We're building this on top of our forum platform — check back soon."
      />
    </div>
  );
};

export default DoubtsContent;
