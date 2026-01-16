import { Search, UserPlus, Calendar, CreditCard, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  icon: React.ElementType;
  label: string;
  value: string;
}

const steps: Step[] = [
  { icon: Search, label: "Search", value: "search" },
  { icon: UserPlus, label: "Registration", value: "registration" },
  { icon: Calendar, label: "Appointment", value: "appointment" },
  { icon: CreditCard, label: "Payment", value: "payment" },
];

interface BookingStepsProps {
  currentStep: string;
  hideSteps?: string[];
}

export function BookingSteps({ currentStep, hideSteps = [] }: BookingStepsProps) {
  const visibleSteps = steps.filter(step => !hideSteps.includes(step.value));
  const currentIndex = visibleSteps.findIndex(s => s.value === currentStep);

  return (
    <div className="flex items-center justify-center">
      {visibleSteps.map((step, index) => {
        const Icon = step.icon;
        const isActive = index === currentIndex;
        const isPast = index < currentIndex;
        
        return (
          <div key={step.value} className="flex items-center">
            {/* Step with pill background for active */}
            <div
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full transition-all",
                isActive && "bg-primary/10 border border-primary"
              )}
            >
              {/* Icon - show checkmark for completed steps */}
              {isPast ? (
                <Check
                  className="w-4 h-4 text-primary"
                />
              ) : (
                <Icon
                  className={cn(
                    "w-4 h-4 transition-colors",
                    isActive && "text-primary",
                    !isActive && "text-muted-foreground"
                  )}
                />
              )}
              {/* Label */}
              <span
                className={cn(
                  "text-sm font-medium whitespace-nowrap",
                  isActive && "text-primary",
                  isPast && "text-foreground",
                  !isActive && !isPast && "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
            
            {/* Connector Line */}
            {index < visibleSteps.length - 1 && (
              <div className={cn(
                "w-16 h-px mx-2",
                isPast ? "bg-primary" : "bg-border"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}