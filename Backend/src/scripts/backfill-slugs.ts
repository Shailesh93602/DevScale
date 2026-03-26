/**
 * One-off script: backfill slug columns for Roadmap, MainConcept, and Topic.
 *
 * Slug rules:
 *   Roadmap:     slugify(title)               — title is @unique, so plain slug is safe
 *   MainConcept: slugify(name)                — name is @unique, so plain slug is safe
 *   Topic:       slugify(title) + first-8-of-uuid — title is NOT unique, suffix ensures uniqueness
 *
 * Run: npx ts-node src/scripts/backfill-slugs.ts
 * (or compile via tsconfig.jest.json + run with node as in prior scripts)
 */

import prisma from '../lib/prisma';
import { slugify, generateTopicSlug } from '../utils/slugify';

async function backfillRoadmaps(): Promise<number> {
  const roadmaps = await prisma.roadmap.findMany({
    select: { id: true, title: true, slug: true },
  });

  let count = 0;
  for (const rm of roadmaps) {
    const slug = slugify(rm.title);
    if (!slug || slug === rm.slug) continue;
    try {
      await prisma.roadmap.update({ where: { id: rm.id }, data: { slug } });
      count++;
      console.log(`  Roadmap: "${rm.title}" → "${slug}"`);
    } catch {
      // Collision — append id suffix as fallback
      const fallback = `${slug}-${rm.id.slice(0, 8)}`;
      try {
        await prisma.roadmap.update({ where: { id: rm.id }, data: { slug: fallback } });
        count++;
        console.log(`  Roadmap (fallback): "${rm.title}" → "${fallback}"`);
      } catch (err2) {
        console.error(`  ✗ Roadmap "${rm.title}":`, err2);
      }
    }
  }
  return count;
}

async function backfillMainConcepts(): Promise<number> {
  const concepts = await prisma.mainConcept.findMany({
    select: { id: true, name: true },
  });

  let count = 0;
  for (const mc of concepts) {
    const slug = slugify(mc.name);
    if (!slug) continue;
    try {
      await prisma.mainConcept.update({ where: { id: mc.id }, data: { slug } });
      count++;
      console.log(`  MainConcept: "${mc.name}" → "${slug}"`);
    } catch {
      const fallback = `${slug}-${mc.id.slice(0, 8)}`;
      try {
        await prisma.mainConcept.update({ where: { id: mc.id }, data: { slug: fallback } });
        count++;
        console.log(`  MainConcept (fallback): "${mc.name}" → "${fallback}"`);
      } catch (err2) {
        console.error(`  ✗ MainConcept "${mc.name}":`, err2);
      }
    }
  }
  return count;
}

async function backfillTopics(): Promise<number> {
  const topics = await prisma.topic.findMany({
    select: { id: true, title: true },
  });

  let count = 0;
  for (const topic of topics) {
    const slug = generateTopicSlug(topic.title, topic.id);
    if (!slug) continue;
    try {
      await prisma.topic.update({ where: { id: topic.id }, data: { slug } });
      count++;
    } catch (err) {
      console.error(`  ✗ Topic "${topic.title}":`, err);
    }
  }
  return count;
}

async function main() {
  console.log('Backfilling Roadmap slugs…');
  const r = await backfillRoadmaps();
  console.log(`  → ${r} roadmaps updated\n`);

  console.log('Backfilling MainConcept slugs…');
  const c = await backfillMainConcepts();
  console.log(`  → ${c} main concepts updated\n`);

  console.log('Backfilling Topic slugs…');
  const t = await backfillTopics();
  console.log(`  → ${t} topics updated\n`);

  console.log(`Done. Total: ${r + c + t} records slugified.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
