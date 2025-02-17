'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { clearUser } from '@/lib/features/user/userSlice';

export default function Logout() {
  const router = useRouter();
  const dispatch = useDispatch();

  const logout = async () => {
    dispatch(clearUser());
    document.cookie = 'token=; Max-Age=0; path=/;';
    router.push('/auth/login');
  };

  useEffect(() => {
    logout();
  }, [router]);

  return null;
}
