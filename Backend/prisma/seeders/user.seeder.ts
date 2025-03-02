import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();

// Supabase client initialization
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const defaultUsers = [
  {
    email: 'admin@mrengineers.com',
    username: 'admin',
    password: 'Admin@123',
    full_name: 'Admin User',
    role: 'ADMIN',
    is_verified: true,
  },
  {
    email: 'moderator@mrengineers.com',
    username: 'moderator',
    password: 'Mod@123',
    full_name: 'Moderator User',
    role: 'MODERATOR',
    is_verified: true,
  },
  {
    email: 'shailesh@mrengineers.com',
    username: 'shailesh',
    password: 'Shailesh@123',
    full_name: 'Shailesh Chaudhari',
    role: 'ADMIN',
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
        full_name: userData.full_name,
        username: userData.username,
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
        full_name: userData.full_name,
        is_verified: userData.is_verified,
        role_id: role.id,
      },
      create: {
        email: userData.email,
        supabase_id: supabaseId,
        username: userData.username,
        full_name: userData.full_name,
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
      // Check if user already exists in Supabase
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', userData.email)
        .single();

      let supabaseUser;

      if (!existingUser) {
        // Create user in Supabase
        supabaseUser = await createUserInSupabase(userData);
      } else {
        console.log(`User ${userData.email} already exists in Supabase`);
        supabaseUser = existingUser;
      }

      // Create or update user in database
      await createUserInDatabase(userData, supabaseUser.id);

      console.log(`Successfully created/updated user: ${userData.email}`);
    }

    console.log('User seeding completed successfully');
  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedUsers();
