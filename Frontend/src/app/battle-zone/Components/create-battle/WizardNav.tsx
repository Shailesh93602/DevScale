import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LAST_STEP, type CreateBattleWizard } from './useCreateBattleWizard';

/** Why Next is disabled, so a blocked button never looks like a broken form (Bug 20). */
function blockedReason(w: CreateBattleWizard): string | false {
  if (w.activeStep === 1) return 'Add a battle title to continue.';
  if (w.activeStep === 2) return 'Pick a question source to continue.';
  return (
    w.activeStep === 3 &&
    w.formValues.type === 'SCHEDULED' &&
    'Pick a date and time for the scheduled battle.'
  );
}

export function WizardNav({
  w,
  onCancel,
}: {
  w: CreateBattleWizard;
  onCancel?: () => void;
}) {
  const { activeStep, prevStep } = w;

  if (activeStep === LAST_STEP) {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={prevStep}
        className="w-full"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Settings
      </Button>
    );
  }

  const valid = w.isStepValid();
  return (
    <div className="space-y-2 pt-2">
      {!valid && (
        <output className="block rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-warning">
          {blockedReason(w)}
        </output>
      )}
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={activeStep === 1 && onCancel ? onCancel : prevStep}
          disabled={activeStep === 1 && !onCancel}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {activeStep === 1 ? 'Cancel' : 'Back'}
        </Button>
        <Button
          type="button"
          onClick={w.nextStep}
          disabled={!valid}
          aria-disabled={!valid}
        >
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
