import { useEffect, useState } from "react";
import { Printer } from "lucide-react";

interface TokenGenerationCardProps {
  token: string;
  patientName: string;
  specialty: string;
  doctor: string;
  time: string;
  onComplete: () => void;
}

export function TokenGenerationCard({
  token,
  patientName,
  specialty,
  doctor,
  time,
  onComplete,
}: TokenGenerationCardProps) {
  const [stage, setStage] = useState<"generating" | "printing" | "printed">("generating");

  useEffect(() => {
    // Stage 1: Generating (2 seconds)
    const timer1 = setTimeout(() => {
      setStage("printing");
    }, 2000);

    // Stage 2: Printing (2 seconds)
    const timer2 = setTimeout(() => {
      setStage("printed");
    }, 4000);

    // Stage 3: Complete (1.5 seconds after printed)
    const timer3 = setTimeout(() => {
      onComplete();
    }, 5500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  return (
    <div className="fixed bottom-6 right-6 w-[320px] bg-card border border-border rounded-lg shadow-lg p-4 animate-in slide-in-from-bottom-5 z-50">
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-foreground">Token Generated</h3>
        
        <div className="text-center py-2">
          <div className="text-2xl font-semibold text-primary">
            {token}
          </div>
          <div className="text-sm text-muted-foreground mt-1">{patientName}</div>
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Specialty:</span>
            <span className="text-foreground font-medium">{doctor} – {specialty}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Time:</span>
            <span className="text-foreground font-medium">{time}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <Printer className="w-4 h-4 text-primary" />
          <span className="text-xs text-muted-foreground">
            {stage === "generating" && "Sending to printer"}
            {stage === "printing" && "Sending to printer"}
            {stage === "printed" && "Printed successfully"}
          </span>
        </div>
      </div>
    </div>
  );
}
