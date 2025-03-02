import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ContactInfo() {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="address">Address</Label>
        <Input id="address" {...register('address')} />
        {errors.address && (
          <p className="mt-1 text-sm text-destructive">
            {errors.address.message as string}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="githubUrl">GitHub URL</Label>
        <Input id="githubUrl" {...register('githubUrl')} />
        {errors.githubUrl && (
          <p className="mt-1 text-sm text-destructive">
            {errors.githubUrl.message as string}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
        <Input id="linkedinUrl" {...register('linkedinUrl')} />
        {errors.linkedinUrl && (
          <p className="mt-1 text-sm text-destructive">
            {errors.linkedinUrl.message as string}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="twitterUrl">Twitter URL</Label>
        <Input id="twitterUrl" {...register('twitterUrl')} />
        {errors.twitterUrl && (
          <p className="mt-1 text-sm text-destructive">
            {errors.twitterUrl.message as string}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="websiteUrl">Website URL</Label>
        <Input id="websiteUrl" {...register('websiteUrl')} />
        {errors.websiteUrl && (
          <p className="mt-1 text-sm text-destructive">
            {errors.websiteUrl.message as string}
          </p>
        )}
      </div>
    </div>
  );
}
