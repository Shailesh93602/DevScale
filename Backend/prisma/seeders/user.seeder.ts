import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();

// Supabase client initialization
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const defaultUsers = [
  {
    email: 'admin@eduscale.io',
    username: 'admin',
    password: 'Admin@123',
    first_name: 'Admin',
    last_name: 'User',
    role: 'ADMIN',
    is_verified: true,
  },
  {
    email: 'moderator@eduscale.io',
    username: 'moderator',
    password: 'Mod@123',
    first_name: 'Moderator',
    last_name: 'User',
    role: 'MODERATOR',
    is_verified: true,
  },
  {
    email: 'testuser@yopmail.com',
    username: 'teststudent',
    password: 'Test@123',
    first_name: 'Test',
    last_name: 'Student',
    role: 'STUDENT',
    is_verified: true,
  },
  {
    email: 'battleplayer2@yopmail.com',
    username: 'testplayer2',
    password: 'Test@1234',
    first_name: 'Battle',
    last_name: 'Player 2',
    role: 'STUDENT',
    is_verified: true,
  },
];

async function createUserInSupabase(userData: (typeof defaultUsers)[0]) {
  try {
    const { data: supabaseUser, error } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: {
        first_name: userData.first_name,
        last_name: userData.last_name,
        username: userData.username,
      },
      // The edge middleware gates /admin on app_metadata.role, so it MUST be
      // set here — user_metadata alone is not read by the route guard.
      app_metadata: {
        role: userData.role.toUpperCase(),
      },
    });

    if (error) {
      throw error;
    }

    return supabaseUser.user;
  } catch (error) {
    console.error(
      `Failed to create Supabase user for ${userData.email}:`,
      error
    );
    throw error;
  }
}

// Keep Supabase app_metadata.role in sync for users that already exist (the
// create path only runs once; without this, re-seeding never repairs a missing
// or stale role claim on the JWT).
async function syncSupabaseRole(supabaseId: string, role: string) {
  const { error } = await supabase.auth.admin.updateUserById(supabaseId, {
    app_metadata: { role: role.toUpperCase() },
  });
  if (error) {
    console.error(`Failed to sync app_metadata.role for ${supabaseId}:`, error);
  }
}

async function createUserInDatabase(
  userData: (typeof defaultUsers)[0],
  supabaseId: string
) {
  try {
    const role = await prisma.role.upsert({
      where: { name: userData.role },
      update: {},
      create: {
        name: userData.role,
        description: `${userData.role} role`,
      },
    });

    return await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        supabase_id: supabaseId,
        username: userData.username,
        first_name: userData.first_name,
        last_name: userData.last_name,
        is_verified: userData.is_verified,
        role_id: role.id,
      },
      create: {
        email: userData.email,
        supabase_id: supabaseId,
        username: userData.username,
        first_name: userData.first_name,
        last_name: userData.last_name,
        is_verified: userData.is_verified,
        role_id: role.id,
      },
    });
  } catch (error) {
    console.error(
      `Failed to create database user for ${userData.email}:`,
      error
    );
    throw error;
  }
}

async function seedUsers() {
  try {
    for (const userData of defaultUsers) {
      // Check if user already exists in Supabase Auth
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(
        (u) => u.email === userData.email
      );

      let supabaseUser;

      if (!existingUser) {
        // Create user in Supabase
        supabaseUser = await createUserInSupabase(userData);
      } else {
        console.log(`User ${userData.email} already exists in Supabase`);
        supabaseUser = existingUser;
        // Repair the role claim on existing users too (idempotent re-seed).
        await syncSupabaseRole(supabaseUser.id, userData.role);
      }

      // Create or update user in database
      await createUserInDatabase(userData, supabaseUser.id);

      console.log(
        `Successfully created/updated user: ${userData.email} (role=${userData.role})`
      );
    }

    console.log('User seeding completed successfully');
  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedUsers();
