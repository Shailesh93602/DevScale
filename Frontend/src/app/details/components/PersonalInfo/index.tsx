import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useEffect, useState, useCallback } from 'react';
import { debounce } from '@/lib/utils';
import { useAxiosGet } from '@/hooks/useAxios';

export function PersonalInfo() {
  const {
    register,
    formState: { errors },
    setError,
    clearErrors,
    watch,
  } = useFormContext();
  const [isChecking, setIsChecking] = useState(false);
  const usernameValue = watch('username');
  const [checkUsernameAvailability] = useAxiosGet<{ available: boolean }>(
    '/users/check-username',
  );

  // Debounced username check
  const checkUsername = useCallback(
    debounce(async (username: string) => {
      if (username.length < 3) return;

      try {
        setIsChecking(true);
        const { data } = await checkUsernameAvailability({
          params: { username },
        });

        if (!data?.available) {
          setError('username', {
            type: 'manual',
            message: 'Username is not available',
          });
        } else {
          clearErrors('username');
        }
      } catch (error) {
        console.error(error);
        setError('username', {
          type: 'manual',
          message: 'Error checking username',
        });
      } finally {
        setIsChecking(false);
      }
    }, 500),
    [],
  );

  // Watch username changes
  useEffect(() => {
    if (usernameValue) {
      checkUsername(usernameValue);
    }
  }, [usernameValue, checkUsername]);

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="full_name">Full Name</Label>
        <Input id="full_name" {...register('full_name')} />
        {errors.full_name && (
          <p className="mt-1 text-sm text-destructive">
            {errors.full_name.message as string}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          {...register('username')}
          onChange={(e) => {
            clearErrors('username');
            if (e.target.value.length >= 3) {
              checkUsername(e.target.value);
            }
          }}
        />
        {isChecking && (
          <p className="mt-1 text-sm text-muted-foreground">
            Checking username availability...
          </p>
        )}
        {errors.username && (
          <p className="mt-1 text-sm text-destructive">
            {errors.username.message as string}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" {...register('bio')} />
        {errors.bio && (
          <p className="mt-1 text-sm text-destructive">
            {errors.bio.message as string}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="avatarUrl">Avatar URL</Label>
        <Input id="avatarUrl" {...register('avatarUrl')} />
        {errors.avatarUrl && (
          <p className="mt-1 text-sm text-destructive">
            {errors.avatarUrl.message as string}
          </p>
        )}
      </div>
    </div>
  );
}
