import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  title: string;
  description: string;
}

interface TransferStepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export function TransferStepper({ steps, currentStep, onStepClick }: TransferStepperProps) {
  return (
    <nav aria-label="Transfer progress" className="w-full">
      <ol className="flex items-center gap-2">
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isClickable = step.id <= currentStep && onStepClick;

          return (
            <li key={step.id} className="flex items-center flex-1">
              <button
                type="button"
                onClick={() => isClickable && onStepClick(step.id)}
                disabled={!isClickable}
                className={cn(
                  "flex items-center gap-3 w-full p-3 rounded-lg transition-colors",
                  isClickable && "cursor-pointer hover:bg-muted/50",
                  !isClickable && "cursor-default",
                  isCurrent && "bg-primary/5 border border-primary/20"
                )}
              >
                <div
                  className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                    isCompleted && "bg-primary text-primary-foreground",
                    isCurrent && "bg-primary text-primary-foreground",
                    !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    step.id
                  )}
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <p className={cn(
                    "text-sm font-medium truncate",
                    isCurrent ? "text-primary" : "text-foreground"
                  )}>
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {step.description}
                  </p>
                </div>
              </button>
              
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "w-8 h-0.5 mx-2 flex-shrink-0",
                    isCompleted ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
