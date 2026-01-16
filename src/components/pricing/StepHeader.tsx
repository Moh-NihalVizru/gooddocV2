interface Step {
  id: number;
  name: string;
}

interface StepHeaderProps {
  steps: Step[];
  currentStep: number;
}

export function StepHeader({ steps, currentStep }: StepHeaderProps) {
  return (
    <div className="mb-8 flex items-center justify-center gap-4">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= step.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {step.id}
          </div>
          <span className="text-sm font-medium">
            {step.name}
          </span>
          {index < steps.length - 1 && (
            <div className="w-12 h-[2px] bg-muted mx-2" />
          )}
        </div>
      ))}
    </div>
  );
}
