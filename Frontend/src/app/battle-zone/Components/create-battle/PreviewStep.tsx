import type { ReactNode } from 'react';
import { Loader2, Sword } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import QuestionPreviewList from '@/components/Battle/QuestionPreviewList';
import { STEP_CARD_CLASS, StepMotion } from './StepShell';
import type { CreateBattleWizard } from './useCreateBattleWizard';

function SummaryRow({
  label,
  value,
  capitalize,
}: {
  label: string;
  value: ReactNode;
  capitalize?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={capitalize ? 'font-medium capitalize' : 'font-medium'}>
        {value}
      </span>
    </div>
  );
}

export function PreviewStep({ w }: { w: CreateBattleWizard }) {
  const { formValues, questionSource, isSubmitting } = w;
  return (
    <StepMotion className="space-y-4">
      <Card className={STEP_CARD_CLASS}>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium">Question Preview</h3>
            <Badge variant="outline" className="ml-auto">
              Auto-selected
            </Badge>
          </div>
          {questionSource ? (
            <QuestionPreviewList
              source={questionSource}
              difficulty={formValues.difficulty?.toUpperCase()}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              No source selected — go back to Step 2.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="border border-dashed">
        <CardContent className="pt-4">
          <div className="grid gap-1 text-sm">
            <SummaryRow label="Title" value={formValues.title} />
            <SummaryRow
              label="Type"
              value={formValues.type?.toLowerCase()}
              capitalize
            />
            <SummaryRow
              label="Difficulty"
              value={formValues.difficulty?.toLowerCase()}
              capitalize
            />
            <SummaryRow
              label="Questions"
              value={questionSource?.count ?? '—'}
            />
            <SummaryRow label="Source" value={questionSource?.label ?? '—'} />
            <SummaryRow
              label="Max Players"
              value={formValues.maxParticipants ?? 6}
            />
          </div>
        </CardContent>
      </Card>

      <Button
        type="button"
        className="w-full"
        size="lg"
        disabled={isSubmitting || !questionSource}
        onClick={w.handleCreateBattle}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating battle...
          </>
        ) : (
          <>
            <Sword className="mr-2 h-4 w-4" />
            Create Battle & Load Questions
          </>
        )}
      </Button>
    </StepMotion>
  );
}
