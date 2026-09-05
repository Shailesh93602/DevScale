import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  PLATFORM_AUTHOR_NAME,
  SYSTEM_AUTHOR_USERNAME,
  isSystemAuthor,
  roadmapAuthorInitial,
  roadmapAuthorName,
} from './roadmap-author';

const repoRoot = join(__dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(join(repoRoot, rel), 'utf8');

describe('roadmapAuthorName', () => {
  it('names the platform, not "Admin User", for system-authored roadmaps', () => {
    // Exactly the fields the seeded platform account carries.
    const seeded = {
      username: 'admin',
      first_name: 'Admin',
      last_name: 'User',
    };
    expect(isSystemAuthor(seeded)).toBe(true);
    expect(roadmapAuthorName(seeded)).toBe(PLATFORM_AUTHOR_NAME);
    expect(roadmapAuthorName(seeded)).not.toMatch(/admin user/i);
    expect(roadmapAuthorInitial(seeded)).toBe(PLATFORM_AUTHOR_NAME.charAt(0));
  });

  it('keeps the precedence the cards already used for real people', () => {
    expect(
      roadmapAuthorName({
        username: 'jdoe',
        first_name: 'Jane',
        last_name: 'Doe',
      }),
    ).toBe('Jane Doe');
    expect(
      roadmapAuthorName({
        username: 'jdoe',
        first_name: 'Jane',
        last_name: null,
      }),
    ).toBe('Jane');
    expect(
      roadmapAuthorName({
        username: 'jdoe',
        first_name: null,
        last_name: null,
      }),
    ).toBe('jdoe');
    expect(roadmapAuthorInitial({ username: 'jdoe', first_name: 'Jane' })).toBe(
      'J',
    );
  });

  it('falls back only when there is nothing to show', () => {
    expect(roadmapAuthorName(undefined)).toBe('');
    expect(roadmapAuthorName(null, 'Anonymous')).toBe('Anonymous');
    expect(
      roadmapAuthorName({ username: '', first_name: '' }, 'Anonymous'),
    ).toBe('Anonymous');
    expect(roadmapAuthorInitial(null)).toBe('U');
  });

  it('does not treat a human admin with a different username as the platform', () => {
    // Recognition is by the seeded username, not by the word "Admin" in a name.
    expect(
      roadmapAuthorName({
        username: 'priya',
        first_name: 'Admin',
        last_name: 'Kaur',
      }),
    ).toBe('Admin Kaur');
  });
});

describe('the system-author contract holds against the sources it depends on', () => {
  it('SYSTEM_AUTHOR_USERNAME is the username the seeder gives admin@eduscale.io', () => {
    // If the seeder renames the platform account, this constant must follow —
    // otherwise every card silently goes back to showing the account's name.
    const seeder = read('Backend/prisma/seeders/user.seeder.ts');
    const block = /email: 'admin@eduscale\.io',\s*username: '([^']+)'/.exec(
      seeder,
    );
    expect(
      block,
      'seeder must define the admin@eduscale.io account',
    ).not.toBeNull();
    expect(block?.[1]).toBe(SYSTEM_AUTHOR_USERNAME);
  });

  it('every roadmap author render goes through the helper, not an inline name', () => {
    // The three places that used to assemble `${first_name} ${last_name}` by
    // hand. A fourth copy would bring "Admin User" back on that surface only.
    const sites = [
      'Frontend/src/components/Roadmap/RoadmapCard.tsx',
      'Frontend/src/app/career-roadmap/roadmaps/page.tsx',
      'Frontend/src/app/dashboard/page.tsx',
    ];
    for (const rel of sites) {
      const src = read(rel);
      expect(src, `${rel} must import the helper`).toMatch(
        /from '@\/lib\/roadmap-author'/,
      );
      expect(src, `${rel} still builds the author name inline`).not.toMatch(
        /roadmap\.user\.first_name\}\s*\$\{roadmap\.user\.last_name/,
      );
    }
  });
});
