import type { ComponentType } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Timer,
  Trophy,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { difficulties } from '@/constants';
import { cn } from '@/lib/utils';
import type { BattleFormValues } from '../battleFormValidation';
import { HelpTip, StepCard } from './StepShell';
import type { CreateBattleWizard } from './useCreateBattleWizard';

type Control = CreateBattleWizard['form']['control'];
type IconType = ComponentType<{ className?: string }>;

const BATTLE_TYPES = ['QUICK', 'SCHEDULED', 'PRACTICE'] as const;

const titleCase = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

function BattleTypeField({ control }: { control: Control }) {
  return (
    <FormField
      control={control}
      name="type"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Battle Type</FormLabel>
          <div className="grid grid-cols-3 gap-2">
            {BATTLE_TYPES.map((t) => (
              <Button
                key={t}
                type="button"
                variant={field.value === t ? 'default' : 'outline'}
                className="capitalize"
                onClick={() => field.onChange(t)}
              >
                {titleCase(t)}
              </Button>
            ))}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function DifficultyField({ control }: { control: Control }) {
  return (
    <FormField
      control={control}
      name="difficulty"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center gap-1">
            Difficulty
            <HelpTip>Filters questions from the pool by difficulty</HelpTip>
          </FormLabel>
          <div className="grid grid-cols-3 gap-2">
            {Object.values(difficulties).map((d) => (
              <Button
                key={d}
                type="button"
                variant={field.value === d ? 'default' : 'outline'}
                className={cn(
                  'transition-all duration-200',
                  field.value === d && 'border-2 border-primary shadow-sm',
                )}
                onClick={() => field.onChange(d)}
              >
                {titleCase(d)}
              </Button>
            ))}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function ScheduleInput({
  control,
  name,
  label,
  icon: Icon,
  type,
}: {
  control: Control;
  name: 'date' | 'time';
  label: string;
  icon: IconType;
  type: 'date' | 'time';
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="relative">
              <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type={type}
                {...(type === 'date'
                  ? { min: new Date().toISOString().split('T')[0] }
                  : { step: 60 })}
                value={field.value ?? ''}
                onChange={(e) => field.onChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function NumberSetting({
  control,
  name,
  icon: Icon,
  label,
  min,
  max,
}: {
  control: Control;
  name: keyof Pick<
    BattleFormValues,
    'maxParticipants' | 'timePerQuestion' | 'pointsPerQuestion'
  >;
  icon: IconType;
  label: string;
  min: number;
  max: number;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center gap-1">
            <Icon className="h-4 w-4" /> {label}
          </FormLabel>
          <FormControl>
            <Input
              type="number"
              min={min}
              max={max}
              {...field}
              value={field.value ?? ''}
              onChange={(e) => field.onChange(parseInt(e.target.value))}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function SettingsStep({ w }: { w: CreateBattleWizard }) {
  const { control } = w.form;
  const { showAdvancedOptions, setShowAdvancedOptions } = w;
  return (
    <StepCard contentClassName="space-y-6 pt-6">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-medium">Battle Settings</h3>
      </div>

      <BattleTypeField control={control} />
      <DifficultyField control={control} />

      {w.formValues.type === 'SCHEDULED' && (
        <div className="grid gap-4 md:grid-cols-2">
          <ScheduleInput
            control={control}
            name="date"
            label="Date"
            icon={CalendarIcon}
            type="date"
          />
          <ScheduleInput
            control={control}
            name="time"
            label="Time"
            icon={Clock}
            type="time"
          />
        </div>
      )}

      <div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
          className="text-xs"
        >
          {showAdvancedOptions ? 'Hide' : 'Show'} Advanced Options
        </Button>
      </div>

      {showAdvancedOptions && (
        <div className="space-y-4 rounded-md border bg-muted/30 p-4">
          <NumberSetting
            control={control}
            name="maxParticipants"
            icon={Users}
            label="Max Participants"
            min={2}
            max={10}
          />
          <NumberSetting
            control={control}
            name="timePerQuestion"
            icon={Timer}
            label="Seconds Per Question"
            min={15}
            max={60}
          />
          <NumberSetting
            control={control}
            name="pointsPerQuestion"
            icon={Trophy}
            label="Points Per Question"
            min={10}
            max={1000}
          />
        </div>
      )}
    </StepCard>
  );
}
