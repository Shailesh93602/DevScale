import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const CHALLENGES_DIR = path.resolve(__dirname, '../../resources/challenges');

async function cleanup() {
  try {
    if (!fs.existsSync(CHALLENGES_DIR)) {
      console.error(`Challenges directory not found: ${CHALLENGES_DIR}`);
      return;
    }

    const folders = fs
      .readdirSync(CHALLENGES_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    const titlesToRemove: string[] = [];

    for (const slug of folders) {
      const metaPath = path.join(CHALLENGES_DIR, slug, 'meta.json');
      if (fs.existsSync(metaPath)) {
        const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
        if (meta.status === 'DRAFT') {
            titlesToRemove.push(meta.title);
        }
      }
    }

    console.log(`Found ${titlesToRemove.length} challenges marked as DRAFT in meta files.`);

    if (titlesToRemove.length > 0) {
        // Delete test cases and then challenges
        const challengesToDelete = await prisma.challenge.findMany({
            where: {
                title: { in: titlesToRemove }
            },
            select: { id: true, title: true }
        });

        console.log(`Found ${challengesToDelete.length} of these in the database.`);

        for (const c of challengesToDelete) {
            console.log(`Deleting: ${c.title}`);
            // Deleting test cases explicitly to be safe, though usually handled by relation
            await prisma.testCase.deleteMany({ where: { challenge_id: c.id } });
            // Delete challenge drafts if any
            // await prisma.challengeDraft.deleteMany({ where: { challenge_id: c.id } }); // Assuming it exists
            
            await prisma.challenge.delete({ where: { id: c.id } });
        }
        console.log('Cleanup finished.');
    } else {
        console.log('No challenges to remove.');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();
