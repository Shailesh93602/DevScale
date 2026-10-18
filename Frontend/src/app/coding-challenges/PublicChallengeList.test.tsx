import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PublicChallengeList } from './PublicChallengeList';

// A real seed description: `# Title`, inline code, a fenced example, rules.
const description = readFileSync(
  resolve(
    process.cwd(),
    '../Backend/resources/challenges/best-time-buy-sell-cooldown/description.md',
  ),
  'utf8',
);
const title = 'Best Time to Buy and Sell Stock with Cooldown';

describe('PublicChallengeList card', () => {
  it('shows the title once and the description as wrapping plain text', () => {
    const { container } = render(
      <PublicChallengeList
        challenges={[{ id: 'c1', title, description, difficulty: 'MEDIUM' }]}
        page={1}
        totalPages={1}
        total={1}
      />,
    );
    const card = container.querySelector('li')!;

    expect(screen.getAllByText(title)).toHaveLength(1);
    expect(card.querySelectorAll('h1, pre, code')).toHaveLength(0);
    expect(card.textContent).not.toContain('`');
    expect(card.textContent).toContain(
      'You are given an array prices where prices[i] is the price',
    );
    // Grid/flex children must be allowed to shrink below their content.
    expect(card.className).toContain('min-w-0');
    expect(screen.getByRole('heading', { name: title }).className).toContain(
      'break-words',
    );
  });
});
