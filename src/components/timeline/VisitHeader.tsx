import { Filter, Plus, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface VisitHeaderProps {
  visitId: string;
  status: "active" | "completed";
  patient: {
    name: string;
    mrn: string;
    age: number;
    sex: string;
  };
  onFilter?: () => void;
  onAddEvent?: () => void;
  onMarkDischarged?: () => void;
  onExport?: () => void;
}

export function VisitHeader({
  visitId,
  status,
  patient,
  onFilter,
  onAddEvent,
  onMarkDischarged,
  onExport,
}: VisitHeaderProps) {
  const isActive = status === "active";

  return (
    <div className="sticky top-0 z-10 bg-background border-b border-border">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Patient Summary */}
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-foreground">
              {patient.name}
            </h1>
            <span className="text-sm text-muted-foreground">
              MRN: {patient.mrn} • {patient.age}yo {patient.sex}
            </span>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {isActive ? (
              <>
                <Button variant="outline" size="sm" onClick={onFilter}>
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm" onClick={onAddEvent}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
                <Button variant="default" size="sm" onClick={onMarkDischarged}>
                  Mark as Discharged
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={onExport}>
                <FileDown className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
