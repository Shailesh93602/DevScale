import { CheckIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Stepper({
  steps,
  currentStep,
  onStepClick,
}: {
  steps: (number | string)[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
}) {
  return (
    <nav aria-label="Progress">
      <ol className="flex items-center">
        {steps.map((step, stepIdx) => (
          <li
            key={step}
            className={cn(stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : '')}
          >
            <button
              className={cn(
                'w-full text-left',
                onStepClick && 'cursor-pointer',
              )}
              onClick={() => onStepClick?.(stepIdx)}
              onKeyDown={(e) => {
                if (onStepClick && (e.key === 'Enter' || e.key === ' ')) {
                  onStepClick(stepIdx);
                }
              }}
              disabled={!onStepClick}
            >
              {stepIdx < currentStep ? (
                <div className="group">
                  <span className="flex items-center">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary">
                      <CheckIcon
                        className="h-6 w-6 text-white"
                        aria-hidden="true"
                      />
                    </span>
                    <span className="ml-4 text-sm font-medium text-primary">
                      {step}
                    </span>
                  </span>
                </div>
              ) : (
                <></>
              )}

              {stepIdx === currentStep ? (
                <div className="flex items-center" aria-current="step">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-primary">
                    <span className="text-primary">{stepIdx + 1}</span>
                  </span>
                  <span className="ml-4 text-sm font-medium text-primary">
                    {step}
                  </span>
                </div>
              ) : (
                <></>
              )}
              {stepIdx > currentStep ? (
                <div className="group">
                  <div className="flex items-center">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-gray-300">
                      <span className="text-gray-500">{stepIdx + 1}</span>
                    </span>
                    <span className="ml-4 text-sm font-medium text-gray-500">
                      {step}
                    </span>
                  </div>
                </div>
              ) : (
                <></>
              )}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
