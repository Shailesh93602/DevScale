import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useEffect, useMemo, useState } from 'react';
import { debounce } from '@/lib/utils';
import { useAxiosGet } from '@/hooks/useAxios';

export function PersonalInfo() {
  const {
    register,
    formState: { errors },
    setError,
    clearErrors,
    watch,
    getValues,
  } = useFormContext();
  const [isChecking, setIsChecking] = useState(false);
  const usernameValue = watch('username');
  const [checkUsernameAvailability] = useAxiosGet<{ isAvailable: boolean }>(
    '/users/check-username',
  );

  // Debounced username check
  const checkUsername = useMemo(
    () =>
      debounce(async (username: string) => {
        if (username.length < 3) return;

        setIsChecking(true);
        const res = await checkUsernameAvailability({ params: { username } });
        // A reply for an earlier keystroke must not judge the name typed since.
        if (getValues('username') !== username) return;
        setIsChecking(false);
        if (!res.success) {
          setError('username', {
            type: 'manual',
            message: 'Error checking username',
          });
        } else if (!res.data?.isAvailable) {
          setError('username', {
            type: 'manual',
            message: 'Username is not available',
          });
        } else {
          clearErrors('username');
        }
      }, 500),
    [checkUsernameAvailability, getValues, setError, clearErrors],
  );

  const usernameField = register('username');

  // Watch username changes
  useEffect(() => {
    if (usernameValue) {
      checkUsername(usernameValue);
    }
  }, [usernameValue, checkUsername]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="first_name">First Name</Label>
          <Input id="first_name" {...register('first_name')} />
          {errors.first_name && (
            <p className="mt-1 text-sm text-destructive">
              {errors.first_name.message as string}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="last_name">Last Name</Label>
          <Input id="last_name" {...register('last_name')} />
          {errors.last_name && (
            <p className="mt-1 text-sm text-destructive">
              {errors.last_name.message as string}
            </p>
          )}
        </div>
      </div>
      <div>
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          {...usernameField}
          onChange={(e) => {
            // Chain, not replace: RHF's own onChange is what updates the submitted value.
            void usernameField.onChange(e);
            clearErrors('username');
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
