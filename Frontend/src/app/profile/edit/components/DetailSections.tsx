import {
  Briefcase,
  Code2,
  Github,
  Globe,
  GraduationCap,
  Linkedin,
  MapPin,
  Twitter,
} from 'lucide-react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  ERROR_CLASS,
  INPUT_CLASS,
  LABEL_CLASS,
  MESSAGE_CLASS,
  ProfileForm,
  ProfileTextArea,
  ProfileTextField,
  SectionHeading,
} from './ProfileFields';

const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
];

function ExperienceLevelField({ form }: { form: ProfileForm }) {
  return (
    <FormField
      control={form.control}
      name="experience_level"
      render={({ field }) => (
        <FormItem>
          <FormLabel className={LABEL_CLASS}>Experience Level</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger
                className={cn(
                  INPUT_CLASS,
                  form.formState.errors.experience_level && ERROR_CLASS,
                )}
              >
                <SelectValue placeholder="Select your's" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {EXPERIENCE_LEVELS.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage className={MESSAGE_CLASS} />
        </FormItem>
      )}
    />
  );
}

function GraduationYearField({ form }: { form: ProfileForm }) {
  return (
    <FormField
      control={form.control}
      name="graduation_year"
      render={({ field }) => (
        <FormItem>
          <FormLabel className={LABEL_CLASS}>Graduation Year</FormLabel>
          <FormControl>
            <Input
              type="number"
              placeholder="2025"
              className={cn(
                INPUT_CLASS,
                form.formState.errors.graduation_year && ERROR_CLASS,
              )}
              {...field}
              value={field.value || ''}
              onChange={(e) =>
                field.onChange(
                  e.target.value ? parseInt(e.target.value) : undefined,
                )
              }
            />
          </FormControl>
          <FormMessage className={MESSAGE_CLASS} />
        </FormItem>
      )}
    />
  );
}

export function ProfessionalSection({ form }: { form: ProfileForm }) {
  return (
    <section className="space-y-8">
      <SectionHeading
        icon={Briefcase}
        title="Professional Profile"
        className="text-blue-500/80"
        ruleClassName="from-blue-500/20"
      />

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <ProfileTextField
          form={form}
          name="specialization"
          label="Specialization / Role"
          placeholder="e.g. Full Stack Developer"
        />
        <ExperienceLevelField form={form} />
      </div>

      <ProfileTextArea
        form={form}
        name="bio"
        label="About Yourself (Bio)"
        placeholder="Briefly describe your journey, passion, and what you're building..."
        className="min-h-[160px]"
        maxLength={500}
        warnAt={450}
      />

      <ProfileTextField
        form={form}
        name="skills"
        labelClassName="ml-1 flex items-center gap-2 font-bold text-foreground/90"
        label={
          <>
            <Code2 className="h-4 w-4" />
            Skills (comma-separated)
          </>
        }
        placeholder="React, TypeScript, Node.js, AWS..."
        description="List your top technical skills to stand out."
      />
    </section>
  );
}

export function AcademicSection({ form }: { form: ProfileForm }) {
  return (
    <section className="space-y-8">
      <SectionHeading
        icon={GraduationCap}
        title="Academic History"
        className="text-green-600/80"
        ruleClassName="from-green-600/20"
      />

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <ProfileTextField
          form={form}
          name="college"
          label="University / College"
          placeholder="IIT Delhi, Stanford University..."
        />
        <GraduationYearField form={form} />
      </div>
    </section>
  );
}

export function OnlinePresenceSection({ form }: { form: ProfileForm }) {
  return (
    <section className="space-y-8">
      <SectionHeading
        icon={Globe}
        title="Online Presence"
        className="text-orange-500/80"
        ruleClassName="from-orange-500/20"
      />

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <ProfileTextField
          form={form}
          name="github_url"
          label="GitHub URL"
          placeholder="https://github.com/username"
          icon={Github}
        />
        <ProfileTextField
          form={form}
          name="linkedin_url"
          label="LinkedIn URL"
          placeholder="https://linkedin.com/in/username"
          icon={Linkedin}
        />
        <ProfileTextField
          form={form}
          name="twitter_url"
          label="X (Twitter) URL"
          placeholder="https://x.com/username"
          icon={Twitter}
        />
        <ProfileTextField
          form={form}
          name="website_url"
          label="Personal Website"
          placeholder="https://yourwebsite.com"
          icon={Globe}
        />
      </div>
    </section>
  );
}

export function AdditionalDetailsSection({ form }: { form: ProfileForm }) {
  return (
    <section className="space-y-8">
      <SectionHeading
        icon={MapPin}
        title="Additional Details"
        className="text-muted-foreground"
        ruleClassName="from-muted-foreground/20"
      />

      <ProfileTextField
        form={form}
        name="address"
        label="Location / Address"
        placeholder="City, Country"
        icon={MapPin}
      />

      <ProfileTextArea
        form={form}
        name="note"
        label="Personal Note / Life Motto"
        placeholder="A short punchy line that defines you..."
        className="min-h-[100px]"
      />
    </section>
  );
}
