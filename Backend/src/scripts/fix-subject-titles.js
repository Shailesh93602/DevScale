/**
 * One-off script: strip hex prefix from subject titles and regenerate slugs.
 * Run: node src/scripts/fix-subject-titles.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const HEX_PREFIX_RE = /^[a-f0-9]{5}_/i;

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

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
      console.log(`✓ "${subject.title}" → title:"${cleanTitle}" slug:"${cleanSlug}"`);
    } catch (err) {
      console.error(`✗ Failed for "${subject.title}":`, err.message);
    }
  }

  console.log(`\nDone. Fixed ${fixed}/${subjects.length} subjects.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
