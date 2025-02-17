import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function PersonalInfo() {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="fullName">Full Name</Label>
        <Input id="fullName" {...register('fullName')} />
        {errors.fullName && (
          <p className="mt-1 text-sm text-destructive">
            {errors.fullName.message as string}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="username">Username</Label>
        <Input id="username" {...register('username')} />
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
