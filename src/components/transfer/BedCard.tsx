import { format } from "date-fns";
import { Bed as BedIcon, Clock, Shield, Wind, Heart, Wifi, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bed, BedFeature } from "@/types/transfer";
import { featureLabels } from "@/data/transfer.mock";

interface BedCardProps {
  bed: Bed;
  isSelected?: boolean;
  onSelect?: (bed: Bed) => void;
  onHold?: (bed: Bed) => void;
  onCancel?: () => void;
  compact?: boolean;
}

const featureIcons: Record<BedFeature, typeof BedIcon> = {
  icu_capable: Shield,
  isolation: AlertTriangle,
  oxygen: Wind,
  ventilator: Wind,
  negative_pressure: Wind,
  cardiac_monitor: Heart,
  telemetry: Wifi,
};

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  available: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Available" },
  occupied: { bg: "bg-red-100", text: "text-red-700", label: "Occupied" },
  cleaning: { bg: "bg-amber-100", text: "text-amber-700", label: "Cleaning" },
  hold: { bg: "bg-blue-100", text: "text-blue-700", label: "On Hold" },
  out_of_service: { bg: "bg-gray-100", text: "text-gray-700", label: "Out of Service" },
};

export function BedCard({ bed, isSelected, onSelect, onHold, onCancel, compact }: BedCardProps) {
  const statusStyle = statusStyles[bed.status] || statusStyles.available;
  const isAvailable = bed.status === "available";

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => isAvailable && onSelect?.(bed)}
        disabled={!isAvailable}
        className={cn(
          "w-full p-3 rounded-lg border text-left transition-all",
          isAvailable && "hover:border-primary hover:bg-primary/5 cursor-pointer",
          !isAvailable && "opacity-60 cursor-not-allowed",
          isSelected && "border-primary bg-primary/5 ring-2 ring-primary/20"
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <BedIcon className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
            <span className="font-medium text-sm truncate">{bed.bedName}</span>
          </div>
          <Badge variant="secondary" className={cn("text-xs", statusStyle.bg, statusStyle.text)}>
            {statusStyle.label}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{bed.roomName}</p>
        <p className="text-xs font-medium mt-1">₹{bed.tariff.toLocaleString()}/day</p>
      </button>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-4 transition-all",
        isAvailable && "hover:border-primary/50 hover:shadow-md",
        isSelected && "border-primary ring-2 ring-primary/20"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <BedIcon className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">{bed.bedName}</h3>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {bed.unitName} • {bed.roomName}
          </p>
        </div>
        <Badge variant="secondary" className={cn(statusStyle.bg, statusStyle.text)}>
          {statusStyle.label}
        </Badge>
      </div>


      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
        <div>
          <p className="text-lg font-semibold text-foreground">₹{bed.tariff.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">per day</p>
        </div>
        
        {bed.status === "hold" && bed.holdExpiresAt && (
          <div className="flex items-center gap-1 text-amber-600 text-xs">
            <Clock className="w-3 h-3" />
            <span>Expires {format(bed.holdExpiresAt, "HH:mm")}</span>
          </div>
        )}
        
        {bed.lastCleanedAt && bed.status === "cleaning" && (
          <p className="text-xs text-muted-foreground">
            Started {format(bed.lastCleanedAt, "HH:mm")}
          </p>
        )}
      </div>

      {isSelected ? (
        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onCancel?.();
            }}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            disabled
          >
            Selected
          </Button>
        </div>
      ) : isAvailable && (
        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onHold?.(bed)}
          >
            Hold 15m
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={() => onSelect?.(bed)}
          >
            Select Bed
          </Button>
        </div>
      )}
    </div>
  );
}
