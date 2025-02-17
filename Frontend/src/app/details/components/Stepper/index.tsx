import { CheckIcon } from 'lucide-react';

export function Stepper({
  steps,
  currentStep,
}: {
  steps: (number | string)[];
  currentStep: number;
}) {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center">
        {steps.map((step, stepIdx) => (
          <li
            key={step}
            className={stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''}
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
            ) : stepIdx === currentStep ? (
              <div className="flex items-center" aria-current="step">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-primary">
                  <span className="text-primary">{stepIdx + 1}</span>
                </span>
                <span className="ml-4 text-sm font-medium text-primary">
                  {step}
                </span>
              </div>
            ) : (
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
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
