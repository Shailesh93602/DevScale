import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function ProfessionalInfo() {
  const {
    register,
    formState: { errors },
    getValues,
    setValue,
  } = useFormContext();

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="specialization">Specialization</Label>
        <Input id="specialization" {...register('specialization')} />
        {errors.specialization && (
          <p className="mt-1 text-sm text-destructive">
            {errors.specialization.message as string}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="skills">Skills (comma-separated)</Label>
        <Input id="skills" {...register('skills')} />
        {errors.skills && (
          <p className="mt-1 text-sm text-destructive">
            {errors.skills.message as string}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="experienceLevel">Experience Level</Label>
        <Select
          onValueChange={(value) => setValue('experienceLevel', value)}
          defaultValue={getValues('experienceLevel')}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select experience level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
            <SelectItem value="expert">Expert</SelectItem>
          </SelectContent>
        </Select>
        {errors.experienceLevel && (
          <p className="mt-1 text-sm text-destructive">
            {errors.experienceLevel.message as string}
          </p>
        )}
      </div>
    </div>
  );
}
