import { format } from "date-fns";
import { Clock, CheckCircle2, MapPin, AlertCircle, XCircle, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { TransferTimelineEvent } from "@/types/transfer";

interface TransferTimelineProps {
  events: TransferTimelineEvent[];
}

const eventConfig: Record<string, { icon: typeof Clock; color: string; bgColor: string }> = {
  request: { icon: FileText, color: "text-blue-600", bgColor: "bg-blue-100" },
  hold: { icon: Clock, color: "text-amber-600", bgColor: "bg-amber-100" },
  checklist: { icon: CheckCircle2, color: "text-emerald-600", bgColor: "bg-emerald-100" },
  moved: { icon: MapPin, color: "text-purple-600", bgColor: "bg-purple-100" },
  completed: { icon: CheckCircle2, color: "text-green-600", bgColor: "bg-green-100" },
  cancelled: { icon: XCircle, color: "text-red-600", bgColor: "bg-red-100" },
};

export function TransferTimeline({ events }: TransferTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Timeline will update as transfer progresses</p>
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {events.map((event, eventIdx) => {
          const config = eventConfig[event.type] || eventConfig.request;
          const Icon = config.icon;

          return (
            <li key={event.id}>
              <div className="relative pb-8">
                {eventIdx !== events.length - 1 && (
                  <span
                    className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-border"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex space-x-3">
                  <div>
                    <span
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full",
                        config.bgColor
                      )}
                    >
                      <Icon className={cn("h-4 w-4", config.color)} />
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p className="text-sm text-foreground">{event.description}</p>
                      {event.actor && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          by {event.actor}
                        </p>
                      )}
                    </div>
                    <div className="whitespace-nowrap text-right text-xs text-muted-foreground">
                      <time dateTime={event.timestamp.toISOString()}>
                        {format(event.timestamp, "HH:mm")}
                      </time>
                      <p>{format(event.timestamp, "dd MMM")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
