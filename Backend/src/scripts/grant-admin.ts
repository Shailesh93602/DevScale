/**
 * Bootstrap / change a user's role from the CLI — updates BOTH the DB role and
 * the Supabase app_metadata.role (the edge middleware gates /admin on the
 * latter). Use this to create the first admin, since the in-app role change
 * also requires an existing admin to reach the panel.
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in the environment.
 *
 *   tsx src/scripts/grant-admin.ts <username-or-email> [ADMIN|MODERATOR|STUDENT]
 */
import prisma from '../lib/prisma.js';
import {
  syncSupabaseUserRole,
  isSupabaseAdminConfigured,
} from '../services/supabaseAdmin.js';

async function main(): Promise<void> {
  const ident = process.argv[2];
  const roleName = (process.argv[3] || 'ADMIN').toUpperCase();
  if (!ident) {
    console.error(
      'Usage: tsx src/scripts/grant-admin.ts <username-or-email> [ADMIN|MODERATOR|STUDENT]'
    );
    process.exit(1);
  }
  if (!isSupabaseAdminConfigured()) {
    console.error(
      'SUPABASE_SECRET_KEY is not set — cannot sync app_metadata (the /admin gate). Set it and re-run.'
    );
    process.exit(1);
  }

  const role = await prisma.role.findFirst({ where: { name: roleName } });
  if (!role) {
    console.error(`Role "${roleName}" not found. Roles must be seeded first.`);
    process.exit(1);
  }

  const user = await prisma.user.findFirst({
    where: { OR: [{ username: ident }, { email: ident }] },
    select: { id: true, username: true, email: true, supabase_id: true },
  });
  if (!user) {
    console.error(`User "${ident}" not found.`);
    process.exit(1);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { role_id: role.id },
  });
  await syncSupabaseUserRole(user.supabase_id, roleName);

  console.log(
    `✅ ${user.username} (${user.email}) → role ${roleName} in DB + Supabase app_metadata.`
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
