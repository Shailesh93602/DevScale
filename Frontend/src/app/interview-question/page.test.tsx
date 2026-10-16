import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// The page reads through useAxiosGet, which never throws: an HTTP error comes
// back as `{ success: false }`. The mock sits at that seam and returns exactly
// that shape, so these tests fail if the page goes back to relying on a throw.
const getInterviewQuestions = vi.fn();
vi.mock('@/hooks/useAxios', () => ({
  useAxiosGet: () => [getInterviewQuestions, {}],
}));
vi.mock('react-redux', () => ({ useDispatch: () => vi.fn() }));
vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

import Page from './page';

describe('/interview-question', () => {
  beforeEach(() => getInterviewQuestions.mockReset());

  it('a 401 or 500 shows the load-failure state, not "No questions yet"', async () => {
    getInterviewQuestions.mockResolvedValue({
      success: false,
      error: true,
      data: null,
      message: 'Authorization token required',
    });
    render(<Page />);
    expect(
      await screen.findByText('Unable to load the questions'),
    ).toBeInTheDocument();
    expect(screen.queryByText('No questions yet')).not.toBeInTheDocument();
  });

  it('an empty successful response shows "No questions yet"', async () => {
    getInterviewQuestions.mockResolvedValue({
      success: true,
      error: false,
      data: [],
      message: 'INTERVIEW_QUESTIONS_FETCHED',
    });
    render(<Page />);
    expect(await screen.findByText('No questions yet')).toBeInTheDocument();
  });

  it('renders the categories it receives', async () => {
    getInterviewQuestions.mockResolvedValue({
      success: true,
      error: false,
      message: 'INTERVIEW_QUESTIONS_FETCHED',
      data: [
        {
          category: 'SQL Interview Questions',
          questions: [
            {
              id: 'sql-1',
              question: 'What is a JOIN?',
              answer: {
                introduction: 'i',
                description: 'd',
                conclusion: 'c',
                points: [],
              },
            },
          ],
        },
      ],
    });
    render(<Page />);
    expect(
      await screen.findByText('SQL Interview Questions'),
    ).toBeInTheDocument();
    expect(screen.getByText('What is a JOIN?')).toBeInTheDocument();
  });
});
