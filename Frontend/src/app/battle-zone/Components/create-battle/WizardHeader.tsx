import { CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { LAST_STEP, STEP_LABELS } from './useCreateBattleWizard';

const stepVariants = {
  inactive: { scale: 1 },
  active: { scale: 1.1, transition: { duration: 0.2 } },
};

const STEPS = Array.from({ length: LAST_STEP }, (_, i) => i + 1);

export function WizardProgress({ formProgress }: { formProgress: number }) {
  const ready = formProgress === 100;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <motion.h2
          initial={{ x: -20 }}
          animate={{ x: 0 }}
          className="text-lg font-semibold"
        >
          Create Battle
        </motion.h2>
        <motion.div initial={{ x: 20 }} animate={{ x: 0 }}>
          <Badge
            variant={ready ? 'default' : 'outline'}
            className={cn(
              'transition-all duration-300',
              ready && 'animate-pulse',
            )}
          >
            {ready ? (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1"
              >
                <CheckCircle2 className="h-3 w-3" />
                Ready to launch
              </motion.span>
            ) : (
              <span>{Math.round(formProgress)}% Complete</span>
            )}
          </Badge>
        </motion.div>
      </div>
      <Progress
        value={formProgress}
        className="h-2 transition-all duration-300"
      />
    </div>
  );
}

export function WizardStepper({
  activeStep,
  onStepBack,
}: {
  activeStep: number;
  onStepBack: (step: number) => void;
}) {
  return (
    <>
      <div
        className="mb-6 flex items-center justify-between"
        role="navigation"
        aria-label="Form steps"
      >
        {STEPS.map((step) => (
          <div key={step} className="flex items-center">
            <motion.div
              variants={stepVariants}
              initial="inactive"
              animate={activeStep === step ? 'active' : 'inactive'}
              className={cn(
                'flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors duration-300',
                activeStep >= step
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground',
              )}
              onClick={() => {
                if (step < activeStep) onStepBack(step);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && step < activeStep) onStepBack(step);
              }}
              role="button"
              tabIndex={0}
              aria-label={`Step ${step}: ${STEP_LABELS[step - 1]}`}
              aria-current={activeStep === step ? 'step' : undefined}
            >
              {activeStep > step ? <CheckCircle2 className="h-4 w-4" /> : step}
            </motion.div>
            {step < LAST_STEP && (
              <div
                className={cn(
                  'h-1 w-10 transition-all duration-300',
                  activeStep > step ? 'bg-primary' : 'bg-muted',
                )}
                role="presentation"
              />
            )}
          </div>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        Step {activeStep} of {LAST_STEP} —{' '}
        <span className="font-medium text-foreground">
          {STEP_LABELS[activeStep - 1]}
        </span>
      </p>
    </>
  );
}
