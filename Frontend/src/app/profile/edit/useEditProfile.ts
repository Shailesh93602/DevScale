import { useEffect, useState } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';
import { useAxiosGet, useAxiosPut } from '@/hooks/useAxios';
import { logger } from '@/lib/logger';
import {
  EMPTY_PROFILE_FORM,
  ProfileFormValues,
  UserProfile,
  formValuesToPayload,
  profileSchema,
  profileToFormValues,
} from './profileForm';

export type UsernameStatus =
  | 'idle'
  | 'checking'
  | 'available'
  | 'taken'
  | 'error';

const NOT_AVAILABLE = 'Username is not available';

/** Debounced availability check for the username field. */
function useUsernameAvailability(
  form: UseFormReturn<ProfileFormValues>,
  profile: UserProfile | null,
) {
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle');
  const [getUsernameCheck] = useAxiosGet<boolean>('/users/check-username');
  const debouncedUsername = useDebounce(form.watch('username'), 500);

  useEffect(() => {
    const checkUsername = async (username: string) => {
      if (!username || username.trim() === '') {
        setUsernameStatus('idle');
        return;
      }

      if (!profile || username === profile.username) {
        setUsernameStatus('available');
        return;
      }

      // A malformed username is shown as "not available" without asking the API.
      const result = profileSchema.shape.username.safeParse(username);
      if (!result.success) {
        setUsernameStatus('taken');
        form.setError('username', { type: 'manual', message: NOT_AVAILABLE });
        return;
      }

      setUsernameStatus('checking');
      try {
        const response = await getUsernameCheck({ params: { username } });
        if (response.success && response.data !== null) {
          const available = response.data;
          setUsernameStatus(available ? 'available' : 'taken');
          if (!available) {
            form.setError('username', {
              type: 'manual',
              message: NOT_AVAILABLE,
            });
          } else {
            form.clearErrors('username');
          }
        } else {
          setUsernameStatus('error');
        }
      } catch (err) {
        logger.error('Error checking username:', err);
        setUsernameStatus('error');
      }
    };

    if (debouncedUsername !== undefined) {
      // Clear errors first before format check
      form.clearErrors('username');
      checkUsername(debouncedUsername);
    } else {
      setUsernameStatus('idle');
      form.clearErrors('username');
    }
  }, [debouncedUsername, getUsernameCheck, profile]);

  return usernameStatus;
}

/** Form, load, username check and submit for the edit-profile page. */
export function useEditProfile() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [getProfile] = useAxiosGet<{ user: UserProfile }>('/users/me');
  const [updateProfile] = useAxiosPut<{ success?: boolean; message?: string }>(
    '/users/me',
  );

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
    defaultValues: EMPTY_PROFILE_FORM,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getProfile();
        if (response.success && response.data) {
          const userData = (response.data.user ?? response.data) as UserProfile;
          setProfile(userData);
          form.reset(profileToFormValues(userData));
        }
      } catch (err) {
        logger.error('Error fetching profile:', err);
        toast.error('Unable to load your profile. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [getProfile, form]);

  const usernameStatus = useUsernameAvailability(form, profile);

  const onSubmit = async (values: ProfileFormValues) => {
    if (usernameStatus === 'taken') {
      form.setError('username', { message: 'Username is already taken' });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await updateProfile(formValuesToPayload(values));
      if (response?.success) {
        toast.success('Profile updated successfully');
        router.push('/profile');
      } else {
        toast.error(
          response?.message || 'Could not save your profile. Please try again.',
        );
      }
    } catch (err) {
      logger.error('Error in profile update submission:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return { router, form, isLoading, isSubmitting, usernameStatus, onSubmit };
}
