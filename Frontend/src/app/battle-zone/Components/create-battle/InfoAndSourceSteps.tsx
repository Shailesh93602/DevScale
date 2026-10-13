import { AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import QuestionSourceSelector from '@/components/Battle/QuestionSourceSelector';
import { HelpTip, StepCard } from './StepShell';
import type { CreateBattleWizard } from './useCreateBattleWizard';

export function BattleInfoStep({ w }: { w: CreateBattleWizard }) {
  const { control } = w.form;
  return (
    <StepCard contentClassName="space-y-6 pt-6">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-medium">Battle Information</h3>
        <Badge variant="outline" className="ml-auto">
          Required
        </Badge>
      </div>

      <FormField
        control={control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-1">
              Battle Title
              <HelpTip>Choose a catchy title for your battle</HelpTip>
            </FormLabel>
            <FormControl>
              <Input placeholder="Enter a catchy title" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Description{' '}
              <span className="text-xs text-muted-foreground">(optional)</span>
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe what this battle is about"
                rows={3}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </StepCard>
  );
}

export function QuestionSourceStep({ w }: { w: CreateBattleWizard }) {
  return (
    <StepCard contentClassName="space-y-4 pt-6">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-medium">Question Source</h3>
        <HelpTip contentClassName="max-w-xs">
          Questions are auto-selected from the quiz pool for the scope you
          choose. No manual entry needed.
        </HelpTip>
        <Badge variant="outline" className="ml-auto">
          Required
        </Badge>
      </div>

      <QuestionSourceSelector
        value={w.questionSource}
        onChange={w.setQuestionSource}
        difficulty={w.formValues.difficulty?.toUpperCase()}
        defaultCount={10}
        maxCount={20}
      />

      {!w.questionSource && (
        <p className="flex items-center gap-2 text-xs text-warning">
          <AlertCircle className="h-3 w-3" />
          Select a roadmap, subject, or topic above to continue
        </p>
      )}
    </StepCard>
  );
}
