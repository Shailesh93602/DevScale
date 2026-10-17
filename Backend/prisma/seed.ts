import { assertSeedTarget } from './seeders/runSeeder.js';

type SeederModule = { default: () => Promise<void> };

// In dependency order. Each is awaited to completion before the next starts.
export const SEEDERS: Array<[string, () => Promise<SeederModule>]> = [
  ['role', () => import('./seeders/role.seeder.js')],
  ['permission', () => import('./seeders/permission.seeder.js')],
  ['feature', () => import('./seeders/feature.seeder.js')],
  ['rolePermission', () => import('./seeders/rolePermission.seeder.js')],
  ['user', () => import('./seeders/user.seeder.js')],
  ['subject', () => import('./seeders/subject.seeder.js')],
  ['topic', () => import('./seeders/topic.seeder.js')],
  ['masterChallenge', () => import('./seeders/masterChallenge.seeder.js')],
  ['battle', () => import('./seeders/battle.seeder.js')],
  ['masterRoadmap', () => import('./seeders/masterRoadmap.seeder.js')],
];

export async function runSeeders(
  seeders: Array<[string, () => Promise<SeederModule>]> = SEEDERS
): Promise<void> {
  for (const [name, load] of seeders) {
    console.log(`🌱 ${name}`);
    const seeder = await load();
    await seeder.default();
  }
}

async function main() {
  assertSeedTarget(process.env, { allowOverride: false });
  console.log('🌱 Starting database seeding...\n');
  await runSeeders();
  console.log('\n✅ Database seeding completed!');
}

if (/(^|[\\/])seed\.(ts|js)$/.test(process.argv[1] ?? '')) {
  main().catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  });
}
