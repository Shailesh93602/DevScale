'use server';

import { revalidatePath } from 'next/cache';

import { createClient } from '@/utils/supabase/server';

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  console.log('SignIn Attempt:', { email: data.email, error });

  if (error) {
    console.log('Login failed, returning error:', error.message);
    return { success: false, error: 'Invalid credentials' };
  }

  console.log('Login successful');
  revalidatePath('/', 'layout');
  return { success: true };
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  return { success: true };
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: {
        first_name: formData.get('first_name') as string,
        last_name: formData.get('last_name') as string,
      },
    },
  };

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/', 'layout');
  return { success: true };
}
