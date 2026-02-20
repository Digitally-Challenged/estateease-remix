import { cn } from "~/lib/utils";
import { Check } from "lucide-react";

interface Step {
  id: string;
  name: string;
  description?: string;
}

interface ProgressStepsProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function ProgressSteps({ steps, currentStep, className }: ProgressStepsProps) {
  return (
    <nav aria-label="Progress" className={className}>
      <ol className="space-y-4 md:flex md:space-x-8 md:space-y-0">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isComplete = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <li key={step.id} className="md:flex-1">
              <div
                className={cn(
                  "group flex flex-col border-l-4 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4",
                  {
                    "border-primary-600": isComplete || isCurrent,
                    "border-gray-200": !isComplete && !isCurrent,
                  },
                )}
              >
                <span className="text-sm font-medium">
                  <span className="flex items-center gap-2">
                    {isComplete ? (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-600">
                        <Check className="h-4 w-4 text-white" />
                      </span>
                    ) : (
                      <span
                        className={cn(
                          "flex h-7 w-7 items-center justify-center rounded-full border-2",
                          {
                            "border-primary-600 text-primary-600":
                              isCurrent,
                            "border-gray-300 text-gray-500":
                              !isCurrent,
                          },
                        )}
                      >
                        {stepNumber}
                      </span>
                    )}
                    <span
                      className={cn({
                        "text-primary-600": isCurrent,
                        "text-gray-900": isComplete,
                        "text-gray-500": !isComplete && !isCurrent,
                      })}
                    >
                      {step.name}
                    </span>
                  </span>
                </span>
                {step.description && (
                  <span className="ml-9 mt-1 text-sm text-gray-500">
                    {step.description}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// Simplified version for mobile
export function MobileProgressSteps({ steps, currentStep }: ProgressStepsProps) {
  const percentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="md:hidden">
      <div className="mb-2 flex justify-between text-sm text-gray-600">
        <span>
          Step {currentStep} of {steps.length}
        </span>
        <span>{steps[currentStep - 1]?.name}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full bg-primary-600 transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
