import type { ComponentType, ReactNode } from 'react';
import type { FieldPath, UseFormReturn } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { ProfileFormValues } from '../profileForm';

export type ProfileForm = UseFormReturn<ProfileFormValues>;
type IconType = ComponentType<{ className?: string }>;
type TextFieldName = Exclude<FieldPath<ProfileFormValues>, 'graduation_year'>;

export const LABEL_CLASS = 'ml-1 font-bold text-foreground/90';
export const MESSAGE_CLASS = 'text-red-500 ml-1';
export const INPUT_CLASS =
  'h-12 rounded-xl border-border/40 bg-muted/20 px-4 transition-all focus:bg-background';
const ICON_INPUT_CLASS =
  'h-12 rounded-xl border-border/40 bg-muted/20 pl-12 transition-all focus:bg-background';
export const ERROR_CLASS = 'border-red-500 focus-visible:ring-red-500';
export const LEADING_ICON_CLASS =
  'absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground';

export function SectionHeading({
  icon: Icon,
  title,
  className,
  ruleClassName,
}: {
  icon: IconType;
  title: string;
  className: string;
  ruleClassName: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 text-sm font-bold uppercase tracking-widest',
        className,
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{title}</span>
      <div
        className={cn(
          'ml-2 h-[1px] flex-1 bg-gradient-to-r to-transparent',
          ruleClassName,
        )}
      />
    </div>
  );
}

/** A single-line text input, optionally with a leading icon. */
export function ProfileTextField({
  form,
  name,
  label,
  placeholder,
  icon: Icon,
  description,
  labelClassName = LABEL_CLASS,
}: {
  form: ProfileForm;
  name: TextFieldName;
  label: ReactNode;
  labelClassName?: string;
  placeholder: string;
  icon?: IconType;
  description?: ReactNode;
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        const input = (
          <FormControl>
            <Input
              placeholder={placeholder}
              className={cn(
                Icon ? ICON_INPUT_CLASS : INPUT_CLASS,
                form.formState.errors[name] && ERROR_CLASS,
              )}
              {...field}
            />
          </FormControl>
        );
        return (
          <FormItem>
            <FormLabel className={labelClassName}>{label}</FormLabel>
            {Icon ? (
              <div className="relative">
                <Icon className={LEADING_ICON_CLASS} />
                {input}
              </div>
            ) : (
              input
            )}
            {description && (
              <FormDescription className="ml-1 mt-2 text-xs">
                {description}
              </FormDescription>
            )}
            <FormMessage className={MESSAGE_CLASS} />
          </FormItem>
        );
      }}
    />
  );
}

/** A textarea, optionally with a live character counter. */
export function ProfileTextArea({
  form,
  name,
  label,
  placeholder,
  className,
  maxLength,
  warnAt,
}: {
  form: ProfileForm;
  name: 'bio' | 'note';
  label: string;
  placeholder: string;
  className: string;
  maxLength?: number;
  warnAt?: number;
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className={LABEL_CLASS}>{label}</FormLabel>
          <FormControl>
            <Textarea
              placeholder={placeholder}
              className={cn(
                'resize-none rounded-xl border-border/40 bg-muted/20 p-4 leading-relaxed transition-all focus:bg-background',
                className,
                form.formState.errors[name] && ERROR_CLASS,
              )}
              {...field}
            />
          </FormControl>
          {maxLength !== undefined && (
            <div className="mt-1 flex justify-end pr-2">
              <span
                className={cn(
                  'font-mono text-xs',
                  (field.value?.length || 0) > (warnAt ?? maxLength)
                    ? 'text-orange-500'
                    : 'text-muted-foreground',
                )}
              >
                {field.value?.length || 0} / {maxLength}
              </span>
            </div>
          )}
          <FormMessage className={MESSAGE_CLASS} />
        </FormItem>
      )}
    />
  );
}
