import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { 
  User, 
  Calendar, 
  Loader2
} from "lucide-react";

interface DischargeConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  patientName: string;
  mrn: string;
  encounterId: string;
}

export function DischargeConfirmationModal({
  open,
  onOpenChange,
  onConfirm,
  patientName,
  mrn,
  encounterId,
}: DischargeConfirmationModalProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // Basic discharge data
  const dischargeSummary = {
    admissionDate: "15-Dec-2025",
    dischargeDate: "20-Dec-2025",
    lengthOfStay: "5 days",
    ward: "General Ward - A",
    bed: "Bed 12",
    primaryDiagnosis: "Acute Viral Gastroenteritis with Dehydration",
    attendingPhysician: "Dr. Meera Nair",
    department: "Internal Medicine",
    conditionAtDischarge: "Stable",
    dischargeTo: "Home",
  };

  const handleConfirm = () => {
    setIsConfirming(true);
    setTimeout(() => {
      onConfirm();
      setIsConfirming(false);
      setConfirmed(false);
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0 border-0 flex flex-col">
        {/* Header */}
        <div className="bg-primary px-6 h-16 flex items-center justify-between rounded-t-lg shrink-0">
          <h2 className="text-base font-semibold text-white">Confirm Discharge</h2>
          <Badge className="bg-white/20 text-white border-0 text-xs">
            Ready
          </Badge>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Patient Info */}
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{patientName}</h3>
              <p className="text-xs text-muted-foreground">MRN: {mrn} • Visit: {encounterId}</p>
            </div>
          </div>

          {/* Basic Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs text-muted-foreground block">Admission Date</span>
              <span className="font-medium">{dischargeSummary.admissionDate}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Discharge Date</span>
              <span className="font-medium">{dischargeSummary.dischargeDate}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Length of Stay</span>
              <span className="font-medium">{dischargeSummary.lengthOfStay}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Ward / Bed</span>
              <span className="font-medium">{dischargeSummary.ward} - {dischargeSummary.bed}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Primary Diagnosis</span>
              <span className="font-medium">{dischargeSummary.primaryDiagnosis}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Attending Physician</span>
              <span className="font-medium">{dischargeSummary.attendingPhysician}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Condition at Discharge</span>
              <Badge className="bg-green-500/10 text-green-600 border-green-500/30 text-xs mt-1">
                {dischargeSummary.conditionAtDischarge}
              </Badge>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Discharge To</span>
              <span className="font-medium">{dischargeSummary.dischargeTo}</span>
            </div>
          </div>

          {/* Confirmation Checkbox */}
          <div className="bg-muted/30 rounded-lg p-4 border border-border">
            <div className="flex items-start gap-3">
              <Checkbox 
                id="confirm-discharge" 
                checked={confirmed}
                onCheckedChange={(checked) => setConfirmed(!!checked)}
              />
              <Label htmlFor="confirm-discharge" className="text-sm cursor-pointer leading-relaxed">
                I confirm that all discharge formalities are complete and the patient is ready for discharge.
              </Label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4 flex items-center justify-end gap-3 bg-muted/30 shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!confirmed || isConfirming}
          >
            {isConfirming ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Confirm Discharge"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
