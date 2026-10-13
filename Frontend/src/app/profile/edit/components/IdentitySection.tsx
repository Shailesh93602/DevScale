import { CheckCircle2, Loader2, Mail, User, XCircle } from 'lucide-react';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { UsernameStatus } from '../useEditProfile';
import {
  LABEL_CLASS,
  LEADING_ICON_CLASS,
  MESSAGE_CLASS,
  ProfileForm,
  ProfileTextField,
  SectionHeading,
} from './ProfileFields';

function UsernameStatusIcon({ status }: { status: UsernameStatus }) {
  return (
    <div className="absolute right-4 top-1/2 -translate-y-1/2">
      {status === 'checking' && (
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      )}
      {status === 'available' && (
        <CheckCircle2 className="text-green-500 h-5 w-5 duration-300 animate-in zoom-in" />
      )}
      {status === 'taken' && (
        <XCircle className="text-red-500 h-5 w-5 duration-300 animate-in zoom-in" />
      )}
    </div>
  );
}

function UsernameField({
  form,
  usernameStatus,
}: {
  form: ProfileForm;
  usernameStatus: UsernameStatus;
}) {
  return (
    <FormField
      control={form.control}
      name="username"
      render={({ field }) => (
        <FormItem>
          <FormLabel className={LABEL_CLASS}>Username</FormLabel>
          <div className="relative">
            <FormControl>
              <Input
                placeholder="johndoe_99"
                className={cn(
                  'h-12 rounded-xl border-border/40 bg-muted/20 px-4 pr-12 font-medium transition-all focus:bg-background',
                  usernameStatus === 'available' &&
                    'border-green-500/50 focus-visible:ring-green-500/20',
                  usernameStatus === 'taken' &&
                    'border-red-500/50 focus-visible:ring-red-500/20',
                )}
                {...field}
              />
            </FormControl>
            <UsernameStatusIcon status={usernameStatus} />
          </div>
          <FormDescription className="ml-1 mt-2 min-h-[0.5rem] text-xs">
            {usernameStatus === 'available' && (
              <span className="text-green-600 font-bold">
                Username is available!
              </span>
            )}
          </FormDescription>
          <FormMessage className={MESSAGE_CLASS} />
        </FormItem>
      )}
    />
  );
}

function EmailField({ form }: { form: ProfileForm }) {
  return (
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel className={LABEL_CLASS}>Email Address</FormLabel>
          <div className="relative">
            <Mail className={LEADING_ICON_CLASS} />
            <FormControl>
              <Input
                placeholder="john@example.com"
                className="h-12 rounded-xl border-border/40 bg-muted/20 pl-12 transition-all focus:bg-background"
                {...field}
                disabled
              />
            </FormControl>
          </div>
          <FormDescription className="ml-1 mt-1 text-xs opacity-70">
            Email cannot be changed for security reasons.
          </FormDescription>
          <FormMessage className={MESSAGE_CLASS} />
        </FormItem>
      )}
    />
  );
}

export function IdentitySection({
  form,
  usernameStatus,
}: {
  form: ProfileForm;
  usernameStatus: UsernameStatus;
}) {
  return (
    <section className="space-y-8">
      <SectionHeading
        icon={User}
        title="Basic Identity"
        className="text-primary/80"
        ruleClassName="from-primary/20"
      />

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <ProfileTextField
          form={form}
          name="first_name"
          label="First Name"
          placeholder="John"
        />
        <ProfileTextField
          form={form}
          name="last_name"
          label="Last Name"
          placeholder="Doe"
        />
        <UsernameField form={form} usernameStatus={usernameStatus} />
        <EmailField form={form} />
      </div>
    </section>
  );
}
