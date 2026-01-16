import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, CheckCircle2, Receipt, Wallet } from "lucide-react";
import { PendingBill, StepStatus } from "@/types/discharge-flow";
import { formatINR } from "@/utils/currency";

interface PendingBillStepProps {
  bills: PendingBill[];
  patientName: string;
  mrn: string;
  encounterId: string;
  stepStatus: StepStatus;
  onBillsUpdated: (bills: PendingBill[]) => void;
  onStepComplete: () => void;
  requireBillingClearance: boolean;
}

const formatCurrency = (amount: number) => formatINR(amount * 100);

export default function PendingBillStep({
  bills,
  requireBillingClearance,
}: PendingBillStepProps) {
  // Calculate totals
  const totalAmount = bills.reduce((sum, b) => sum + b.totalAmount, 0);
  const totalPaid = bills.reduce((sum, b) => sum + b.paidAmount, 0);
  const totalOutstanding = bills.reduce((sum, b) => sum + b.outstandingAmount, 0);
  const allCleared = totalOutstanding === 0;

  // Mock values for demo
  const unbilledAmount = 2000;
  const advancePaid = 8000;
  const totalDue = totalOutstanding + unbilledAmount;
  const totalPayable = totalDue - advancePaid;

  return (
    <div className="flex flex-col items-center py-8">
      {/* Status Messages - Above Cards */}
      <div className="max-w-4xl w-full mb-5">
        {/* Billing Clearance Warning */}
        {requireBillingClearance && totalPayable > 0 && (
          <Card className="p-4 bg-amber-500/10 border-amber-500/30">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-200">Billing Clearance Required</p>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  Outstanding balance of {formatCurrency(totalPayable)} must be cleared before discharge.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* All Cleared Message */}
        {allCleared && totalPayable <= 0 && (
          <Card className="p-4 bg-green-500/10 border-green-500/30">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">All Bills Cleared</p>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  All outstanding bills have been settled.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 max-w-4xl w-full">
        {/* Left: Billing Details Card (3 cols) */}
        <Card className="lg:col-span-3 overflow-hidden border-border/60 shadow-sm">
          <div className="bg-gradient-to-r from-muted/80 to-muted/40 px-5 py-3.5 border-b border-border/50">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-md bg-primary/10">
                <Receipt className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Billing Details</h3>
            </div>
          </div>
          <div className="p-5">
            {/* Charges Section */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Billed Services</span>
                <span className="font-medium text-foreground tabular-nums">{formatCurrency(totalAmount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Unbilled Services</span>
                <span className="font-medium text-foreground tabular-nums">{formatCurrency(unbilledAmount)}</span>
              </div>
            </div>

            <Separator className="my-4 bg-border/50" />

            {/* Gross Total */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-foreground">Gross Total</span>
              <span className="font-semibold text-foreground tabular-nums">{formatCurrency(totalAmount + unbilledAmount)}</span>
            </div>

            {/* Payments Section */}
            <div className="space-y-2.5 bg-muted/30 rounded-lg p-4 -mx-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Bill Payments</span>
                <span className="font-medium text-green-600 tabular-nums">−{formatCurrency(totalPaid)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Advance Deposit</span>
                <span className="font-medium text-green-600 tabular-nums">−{formatCurrency(advancePaid)}</span>
              </div>
              <Separator className="bg-border/40" />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Total Paid</span>
                <span className="font-semibold text-green-600 tabular-nums">−{formatCurrency(totalPaid + advancePaid)}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Right: Payment Summary Card (2 cols) */}
        <Card className="lg:col-span-2 overflow-hidden border-primary/20 shadow-sm bg-gradient-to-br from-primary/5 to-transparent">
          <div className="bg-primary/10 px-5 py-3.5 border-b border-primary/20">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-md bg-primary/20">
                <Wallet className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Payment Summary</h3>
            </div>
          </div>
          <div className="p-5 flex flex-col h-[calc(100%-56px)]">
            <div className="space-y-3 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Gross Total</span>
                <span className="font-medium text-foreground tabular-nums">{formatCurrency(totalAmount + unbilledAmount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Paid</span>
                <span className="font-medium text-green-600 tabular-nums">−{formatCurrency(totalPaid + advancePaid)}</span>
              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-primary/20">
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Amount Payable</p>
                <p className="text-3xl font-bold text-primary tabular-nums">{formatCurrency(totalPayable)}</p>
                {totalPayable > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">Due at discharge</p>
                )}
                {totalPayable <= 0 && (
                  <p className="text-xs text-green-600 font-medium mt-2">Fully Settled ✓</p>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
