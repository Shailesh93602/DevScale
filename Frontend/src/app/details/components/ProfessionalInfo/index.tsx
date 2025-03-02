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
import CreatableSelect from 'react-select/creatable';

export function ProfessionalInfo() {
  const {
    register,
    formState: { errors },
    getValues,
    setValue,
    watch,
  } = useFormContext();
  const skills = watch('skills') || [];

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
        <Label htmlFor="skills">Skills</Label>
        <CreatableSelect
          id="skills"
          isMulti
          value={skills.map((skill: string) => ({
            label: skill,
            value: skill,
          }))}
          onChange={(newValue) => {
            setValue(
              'skills',
              newValue.map((item) => item.value),
              { shouldValidate: true },
            );
          }}
          onCreateOption={(newSkill) => {
            setValue('skills', [...skills, newSkill], { shouldValidate: true });
          }}
          placeholder="Type and press enter to add skills..."
          classNames={{
            control: () => 'border rounded-md text-sm',
            multiValue: () => 'bg-accent rounded-md px-2 py-1 m-1',
            input: () => 'text-foreground',
            placeholder: () => 'text-muted-foreground',
            menu: () => 'bg-background border border-border',
            option: () => 'hover:bg-accent hover:text-accent-foreground',
          }}
          styles={{
            control: (base) => ({
              ...base,
              backgroundColor: 'hsl(var(--background))',
              borderColor: 'hsl(var(--border))',
              color: 'hsl(var(--foreground))',
              '&:hover': {
                borderColor: 'hsl(var(--border))',
              },
            }),
            menu: (base) => ({
              ...base,
              backgroundColor: 'hsl(var(--background))',
              borderColor: 'hsl(var(--border))',
            }),
            option: (base, state) => ({
              ...base,
              backgroundColor: state.isFocused
                ? 'hsl(var(--accent))'
                : 'hsl(var(--background))',
              color: state.isFocused
                ? 'hsl(var(--accent-foreground))'
                : 'hsl(var(--foreground))',
            }),
            multiValue: (base) => ({
              ...base,
              backgroundColor: 'hsl(var(--accent))',
            }),
            multiValueLabel: (base) => ({
              ...base,
              color: 'hsl(var(--accent-foreground))',
            }),
            multiValueRemove: (base) => ({
              ...base,
              color: 'hsl(var(--accent-foreground))',
              ':hover': {
                backgroundColor: 'hsl(var(--accent))',
                color: 'hsl(var(--accent-foreground))',
              },
            }),
            singleValue: (base) => ({
              ...base,
              color: 'hsl(var(--foreground))',
            }),
          }}
        />
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
