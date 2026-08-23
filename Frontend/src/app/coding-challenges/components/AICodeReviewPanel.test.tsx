import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AICodeReviewPanel } from './AICodeReviewPanel';
import type { AiCodeReview } from '@/hooks/useCodeReview';

const review: AiCodeReview = {
  summary: 'Solid solution with a minor edge-case gap.',
  correctness: {
    verdict: 'partially_correct',
    explanation: 'Handles the main case but not empty input.',
  },
  complexity: { time: 'O(n log n)', space: 'O(n)' },
  edgeCasesMissed: ['empty input array'],
  improvements: [
    { title: 'Use a hash map', detail: 'Reduces the inner loop to O(1) lookups.' },
  ],
  score: 72,
};

describe('AICodeReviewPanel', () => {
  it('renders summary, verdict, complexity, score, improvements and edge cases', () => {
    render(<AICodeReviewPanel review={review} />);
    expect(screen.getByText(review.summary)).toBeInTheDocument();
    expect(screen.getByTestId('review-verdict')).toHaveTextContent(
      'Partially correct',
    );
    expect(screen.getByTestId('review-score')).toHaveTextContent('72/100');
    expect(screen.getByTestId('review-time-complexity')).toHaveTextContent(
      'O(n log n)',
    );
    expect(screen.getByTestId('review-space-complexity')).toHaveTextContent(
      'O(n)',
    );
    expect(screen.getByText('Use a hash map')).toBeInTheDocument();
    expect(screen.getByText('empty input array')).toBeInTheDocument();
  });

  it('omits the improvements and edge-case sections when those arrays are empty', () => {
    render(
      <AICodeReviewPanel
        review={{ ...review, improvements: [], edgeCasesMissed: [] }}
      />,
    );
    expect(screen.queryByText('Suggested improvements')).not.toBeInTheDocument();
    expect(screen.queryByText('Edge cases missed')).not.toBeInTheDocument();
  });

  it('formats the verdict label for a correct solution', () => {
    render(
      <AICodeReviewPanel
        review={{
          ...review,
          correctness: { verdict: 'correct', explanation: 'All tests pass.' },
        }}
      />,
    );
    expect(screen.getByTestId('review-verdict')).toHaveTextContent('Correct');
  });
});
