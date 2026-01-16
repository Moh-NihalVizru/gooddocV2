import { 
  Activity, 
  FlaskConical, 
  Pill, 
  ScanLine, 
  Scissors, 
  FileText,
  LogIn,
  LogOut 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { EventType, EventStatus } from "@/types/timeline";

interface EventCardProps {
  type: EventType;
  title: string;
  time: string;
  dept: string;
  status: EventStatus;
  onClick?: () => void;
}

const eventTypeConfig: Record<EventType, { icon: any; color: string; bgColor: string; borderColor: string }> = {
  Admission: { 
    icon: LogIn, 
    color: "text-blue-700", 
    bgColor: "bg-blue-50", 
    borderColor: "border-blue-200" 
  },
  Laboratory: { 
    icon: FlaskConical, 
    color: "text-violet-700", 
    bgColor: "bg-violet-50", 
    borderColor: "border-violet-200" 
  },
  Medication: { 
    icon: Pill, 
    color: "text-green-700", 
    bgColor: "bg-green-50", 
    borderColor: "border-green-200" 
  },
  Radiology: { 
    icon: ScanLine, 
    color: "text-cyan-700", 
    bgColor: "bg-cyan-50", 
    borderColor: "border-cyan-200" 
  },
  Consultation: { 
    icon: Activity, 
    color: "text-indigo-700", 
    bgColor: "bg-indigo-50", 
    borderColor: "border-indigo-200" 
  },
  Procedure: {
    icon: Scissors, 
    color: "text-amber-700", 
    bgColor: "bg-amber-50", 
    borderColor: "border-amber-200" 
  },
  Observation: { 
    icon: FileText, 
    color: "text-slate-700", 
    bgColor: "bg-slate-50", 
    borderColor: "border-slate-200" 
  },
  Discharge: { 
    icon: LogOut, 
    color: "text-emerald-700", 
    bgColor: "bg-emerald-50", 
    borderColor: "border-emerald-200" 
  },
};

export function EventCard({ type, title, time, dept, status, onClick }: EventCardProps) {
  const config = eventTypeConfig[type];
  const Icon = config.icon;
  const isScheduled = status === "Scheduled" || status === "Planned";

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-3 rounded-lg border-2 transition-all hover:shadow-md",
        config.bgColor,
        config.borderColor,
        isScheduled && "border-dashed"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn("flex-shrink-0 mt-0.5", config.color)}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-foreground line-clamp-1 mb-1">
            {title}
          </h4>
          <div className="text-xs text-muted-foreground space-y-0.5">
            <div>{time}</div>
            <div className="line-clamp-1">{dept}</div>
          </div>
        </div>
      </div>
    </button>
  );
}
