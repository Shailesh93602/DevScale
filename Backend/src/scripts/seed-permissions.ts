/**
 * seed-permissions.ts
 *
 * Brings the database's permission catalogue in line with
 * `src/constants/permissions.ts`, and gives each role its default set.
 *
 *   npm run seed:permissions
 *
 * IDEMPOTENT AND ADDITIVE. It upserts permissions and connects role defaults;
 * it does not delete permissions, does not touch per-user overrides, and does
 * not reassign anybody's role. Running it twice changes nothing the second
 * time, which is what makes it safe to run on every deploy.
 *
 * WHAT IT DELIBERATELY DOES NOT DO: remove role permissions that are no longer
 * in ROLE_DEFAULTS. Revoking access is a decision with consequences, and a seed
 * script running unattended on deploy is the wrong place to make it — a typo in
 * a constant should not silently strip a role. Removals are reported and left
 * for a human. Run with --prune to apply them deliberately.
 */
import prisma from '../lib/prisma.js';
import {
  PERMISSION_CATALOGUE,
  ROLE_DEFAULTS,
} from '../constants/permissions.js';

const PRUNE = process.argv.includes('--prune');

async function main() {
  console.log('=== Permission catalogue seed ===\n');

  // 1. The catalogue itself.
  let created = 0;
  for (const entry of PERMISSION_CATALOGUE) {
    const existing = await prisma.permission.findUnique({
      where: { key: entry.key },
    });
    if (existing) {
      await prisma.permission.update({
        where: { key: entry.key },
        data: { name: entry.name, description: entry.description },
      });
    } else {
      await prisma.permission.create({
        data: {
          key: entry.key,
          name: entry.name,
          description: entry.description,
        },
      });
      created++;
    }
  }
  console.log(
    `permissions: ${PERMISSION_CATALOGUE.length} in catalogue, ${created} newly created`
  );

  // 2. Role defaults.
  for (const [roleName, keys] of Object.entries(ROLE_DEFAULTS)) {
    const role = await prisma.role.findUnique({
      where: { name: roleName },
      include: { permissions: { include: { permission: true } } },
    });
    if (!role) {
      console.log(`role ${roleName}: NOT PRESENT in this database — skipped`);
      continue;
    }

    const have = new Set(role.permissions.map((p) => p.permission.key));
    const want = new Set(keys);

    const toAdd = [...want].filter((k) => !have.has(k));
    for (const key of toAdd) {
      const permission = await prisma.permission.findUnique({ where: { key } });
      if (!permission) continue;
      await prisma.rolePermission.create({
        data: { role_id: role.id, permission_id: permission.id },
      });
    }

    const extra = [...have].filter((k) => !want.has(k));
    if (extra.length > 0 && PRUNE) {
      for (const key of extra) {
        const permission = await prisma.permission.findUnique({
          where: { key },
        });
        if (!permission) continue;
        await prisma.rolePermission.deleteMany({
          where: { role_id: role.id, permission_id: permission.id },
        });
      }
    }

    console.log(
      `role ${roleName}: +${toAdd.length} granted` +
        (extra.length
          ? PRUNE
            ? `, -${extra.length} pruned`
            : `, ${extra.length} not in defaults (left alone; use --prune): ${extra.join(', ')}`
          : '')
    );
  }

  console.log('\nDone. No user overrides were touched.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
