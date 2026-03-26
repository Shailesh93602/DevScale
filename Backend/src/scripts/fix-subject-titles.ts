/**
 * One-off script: strip hex prefix from subject titles and regenerate slugs.
 *
 * Pattern: some subjects were seeded with titles like "59231_Compliance Standards"
 * (a 5-char hex prefix + underscore). This script removes that prefix and regenerates
 * the slug from the clean title.
 *
 * Run: npx ts-node src/scripts/fix-subject-titles.ts
 */

import prisma from '../lib/prisma';
import { slugify } from '../utils/slugify';

const HEX_PREFIX_RE = /^[a-f0-9]{5}_/i;

async function main() {
  const subjects = await prisma.subject.findMany({
    select: { id: true, title: true, slug: true },
  });

  let fixed = 0;

  for (const subject of subjects) {
    const cleanTitle = subject.title.replace(HEX_PREFIX_RE, '');
    const cleanSlug = slugify(cleanTitle);

    const titleChanged = cleanTitle !== subject.title;
    const slugChanged = cleanSlug !== subject.slug;

    if (!titleChanged && !slugChanged) continue;

    try {
      await prisma.subject.update({
        where: { id: subject.id },
        data: {
          ...(titleChanged ? { title: cleanTitle } : {}),
          ...(slugChanged ? { slug: cleanSlug } : {}),
        },
      });
      fixed++;
      console.log(`✓ "${subject.title}" → "${cleanTitle}" (slug: ${cleanSlug})`);
    } catch (err) {
      console.error(`✗ Failed for "${subject.title}":`, err);
    }
  }

  console.log(`\nDone. Fixed ${fixed}/${subjects.length} subjects.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
