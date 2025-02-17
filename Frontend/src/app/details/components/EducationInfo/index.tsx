import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function EducationInfo() {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="college">College</Label>
        <Input id="college" {...register('college')} />
        {errors.college && (
          <p className="mt-1 text-sm text-destructive">
            {errors.college.message as string}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="graduationYear">Graduation Year</Label>
        <Input
          id="graduationYear"
          type="number"
          {...register('graduationYear')}
        />
        {errors.graduationYear && (
          <p className="mt-1 text-sm text-destructive">
            {errors.graduationYear.message as string}
          </p>
        )}
      </div>
    </div>
  );
}
