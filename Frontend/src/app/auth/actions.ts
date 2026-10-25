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

  if (error) {
    return { success: false, error: 'Invalid credentials' };
  }

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

  // An existing address must look exactly like a new one, or the form tells
  // anyone which emails have accounts. Both go to the "check your inbox" page.
  if (error && !isAccountExistsError(error)) {
    return { success: false, error: error.message };
  }

  revalidatePath('/', 'layout');
  return { success: true };
}

const ACCOUNT_EXISTS_CODES = new Set(['user_already_exists', 'email_exists']);

function isAccountExistsError(error: { code?: string; message: string }) {
  return (
    ACCOUNT_EXISTS_CODES.has(error.code ?? '') ||
    /already (registered|exists)/i.test(error.message)
  );
}
