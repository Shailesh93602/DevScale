/**
 * One-off script: strip hex prefix from MainConcept names.
 *
 * Pattern: some concepts were seeded with names like "9a609_React Native Foundations"
 * (5-char hex + underscore). This script removes that prefix.
 *
 * Run: npx ts-node src/scripts/fix-main-concept-names.ts
 */

import prisma from '../lib/prisma';

const HEX_PREFIX_RE = /^[a-f0-9]{5}_/i;

async function main() {
  const concepts = await prisma.mainConcept.findMany({
    select: { id: true, name: true },
  });

  let fixed = 0;

  for (const concept of concepts) {
    const cleanName = concept.name.replace(HEX_PREFIX_RE, '');
    if (cleanName === concept.name) continue;

    try {
      await prisma.mainConcept.update({
        where: { id: concept.id },
        data: { name: cleanName },
      });
      fixed++;
      console.log(`✓ "${concept.name}" → "${cleanName}"`);
    } catch (err) {
      console.error(`✗ Failed for "${concept.name}":`, err);
    }
  }

  console.log(`\nDone. Fixed ${fixed}/${concepts.length} main concepts.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
