import { format } from "date-fns";
import { ArrowRight, CheckCircle2, AlertTriangle, FileText, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { TransferRequest, Bed } from "@/types/transfer";
import { transferTypeLabels, priorityLabels, reasonLabels } from "@/data/transfer.mock";

interface ReviewConfirmStepProps {
  data: Partial<TransferRequest>;
  selectedBed?: Bed;
  currentTariff: number;
  onConfirm: () => void;
  onSaveDraft: () => void;
  isSubmitting?: boolean;
}

const priorityColors: Record<string, string> = {
  stat: "bg-red-100 text-red-700",
  urgent: "bg-amber-100 text-amber-700",
  routine: "bg-blue-100 text-blue-700",
};

export function ReviewConfirmStep({ 
  data, 
  selectedBed, 
  currentTariff,
  onConfirm,
  onSaveDraft,
  isSubmitting 
}: ReviewConfirmStepProps) {
  const requiredItems = data.checklist?.filter((item) => item.required) || [];
  const completedRequired = requiredItems.filter((item) => item.checked).length;
  const allRequiredComplete = completedRequired === requiredItems.length;
  
  const costDelta = selectedBed ? selectedBed.tariff - currentTariff : 0;
  const canConfirm = allRequiredComplete && selectedBed;

  return (
    <div className="space-y-6">
      {/* Transfer Summary Card */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="p-4 bg-muted/50 border-b">
          <h3 className="font-semibold text-foreground">Transfer Summary</h3>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Location Transfer */}
          <div className="flex items-center gap-4">
            <div className="flex-1 p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">From</p>
              <p className="font-medium">{data.fromLocation?.unitName}</p>
              <p className="text-sm text-muted-foreground">
                {data.fromLocation?.roomName} • {data.fromLocation?.bedName}
              </p>
            </div>
            
            <ArrowRight className="w-5 h-5 text-primary flex-shrink-0" />
            
            <div className="flex-1 p-3 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-xs text-muted-foreground mb-1">To</p>
              {selectedBed ? (
                <>
                  <p className="font-medium text-primary">{selectedBed.unitName}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedBed.roomName} • {selectedBed.bedName}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No bed selected</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Transfer Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Transfer Type</p>
              <p className="font-medium">
                {data.transferType ? transferTypeLabels[data.transferType] : "—"}
              </p>
            </div>
            
            <div>
              <p className="text-xs text-muted-foreground mb-1">Priority</p>
              {data.priority && (
                <Badge className={cn(priorityColors[data.priority])}>
                  {priorityLabels[data.priority]}
                </Badge>
              )}
            </div>
            
            <div>
              <p className="text-xs text-muted-foreground mb-1">Reason</p>
              <p className="font-medium">
                {data.reason ? reasonLabels[data.reason] : "—"}
              </p>
            </div>
            
            <div>
              <p className="text-xs text-muted-foreground mb-1">Schedule</p>
              <p className="font-medium">
                {data.scheduleType === 'now' 
                  ? "Immediate Transfer" 
                  : data.scheduledAt 
                    ? format(data.scheduledAt, "PPP p")
                    : "—"
                }
              </p>
            </div>
            
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground mb-1">Ordering Clinician</p>
              <p className="font-medium">{data.orderingClinician || "—"}</p>
            </div>
          </div>

          {data.notes && (
            <>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground mb-1">Notes</p>
                <p className="text-sm">{data.notes}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Cost Impact */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="p-4 bg-muted/50 border-b flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          <h3 className="font-semibold text-foreground">Cost Impact</h3>
        </div>
        
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current Daily Tariff</p>
              <p className="text-lg font-semibold">₹{currentTariff.toLocaleString()}</p>
            </div>
            
            <ArrowRight className="w-5 h-5 text-muted-foreground" />
            
            <div className="text-right">
              <p className="text-sm text-muted-foreground">New Daily Tariff</p>
              <p className="text-lg font-semibold">
                {selectedBed ? `₹${selectedBed.tariff.toLocaleString()}` : "—"}
              </p>
            </div>
          </div>
          
          {costDelta !== 0 && (
            <div className={cn(
              "mt-3 p-3 rounded-lg text-center",
              costDelta > 0 ? "bg-red-50" : "bg-emerald-50"
            )}>
              <p className="text-sm text-muted-foreground">Daily Difference</p>
              <p className={cn(
                "text-xl font-bold",
                costDelta > 0 ? "text-red-600" : "text-emerald-600"
              )}>
                {costDelta > 0 ? "+" : ""}₹{costDelta.toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Checklist Status */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="p-4 bg-muted/50 border-b flex items-center gap-2">
          <FileText className="w-4 h-4" />
          <h3 className="font-semibold text-foreground">Checklist Status</h3>
        </div>
        
        <div className="p-4">
          <div className="flex items-center gap-3">
            {allRequiredComplete ? (
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">All required items complete</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">
                  {completedRequired}/{requiredItems.length} required items complete
                </span>
              </div>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground mt-2">
            {data.checklist?.filter((item) => item.checked).length || 0} of{" "}
            {data.checklist?.length || 0} total items checked
          </p>
        </div>
      </div>

      {/* Insurance Pre-Auth Status */}
      {data.insurancePreAuthRequired && (
        <div className={cn(
          "rounded-xl border p-4",
          data.insurancePreAuthStatus === 'approved' 
            ? "bg-emerald-50 border-emerald-200" 
            : "bg-amber-50 border-amber-200"
        )}>
          <div className="flex items-center gap-2">
            {data.insurancePreAuthStatus === 'approved' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            )}
            <div>
              <p className="font-medium">
                Insurance Pre-Authorization:{" "}
                {data.insurancePreAuthStatus === 'approved' ? "Approved" : "Pending"}
              </p>
              <p className="text-sm text-muted-foreground">
                {data.insurancePreAuthStatus === 'approved' 
                  ? "Pre-authorization has been approved for this transfer."
                  : "Pre-authorization may be required for this transfer."
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Warnings */}
      {!canConfirm && (
        <div className="flex items-start gap-2 p-4 bg-red-50 rounded-lg text-red-700">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Cannot confirm transfer</p>
            <ul className="text-sm mt-1 space-y-1 list-disc list-inside">
              {!selectedBed && <li>No destination bed selected</li>}
              {!allRequiredComplete && <li>Required checklist items incomplete</li>}
            </ul>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={onSaveDraft}
          disabled={isSubmitting}
          className="flex-1"
        >
          Save as Draft
        </Button>
        <Button
          onClick={onConfirm}
          disabled={!canConfirm || isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? "Confirming..." : "Confirm & Create Transfer"}
        </Button>
      </div>
    </div>
  );
}
