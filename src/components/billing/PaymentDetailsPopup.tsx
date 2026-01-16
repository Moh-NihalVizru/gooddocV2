import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { formatINR } from "@/utils/currency";

interface PaymentDetailsPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientName: string;
  gdid: string;
  ageSex: string;
  billAmount: number;
  advancePaid: number;
  unbilledAmount?: number;
}

export function PaymentDetailsPopup({
  open,
  onOpenChange,
  patientName,
  gdid,
  ageSex,
  billAmount,
  advancePaid,
  unbilledAmount = 0,
}: PaymentDetailsPopupProps) {
  const advanceBalance = advancePaid; // Remaining advance balance
  const totalDueAmount = billAmount + unbilledAmount;
  const totalPaid = advancePaid;
  const totalPayable = totalDueAmount - totalPaid;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Payment Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Patient Info */}
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="font-semibold text-foreground">{patientName}</p>
            <p className="text-sm text-muted-foreground">GDID - {gdid} • {ageSex}</p>
          </div>

          {/* Billing Summary */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Billing Summary</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground/60">Billed Amount</p>
                <p className="text-sm font-medium">{formatINR(billAmount * 100)}</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground/60">Unbilled Amount</p>
                <p className="text-sm font-medium">{formatINR(unbilledAmount * 100)}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Collection Status */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Collection Status</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground/60">Advance Paid</p>
                <p className="text-sm font-medium text-emerald-600">{formatINR(advancePaid * 100)}</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground/60">Advance Balance</p>
                <p className="text-sm font-medium text-emerald-600">{formatINR(advanceBalance * 100)}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Total Due Amount */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Total Due Amount</h4>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Paid</span>
                <span className="text-sm font-medium text-emerald-600">−{formatINR(totalPaid * 100)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-base font-medium">Total Payable</span>
                <span className={`text-lg font-semibold ${totalPayable > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                  {formatINR(totalPayable * 100)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
