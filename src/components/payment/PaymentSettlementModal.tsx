import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, RotateCcw, AlertCircle } from "lucide-react";
import { formatINR } from "@/utils/currency";
import { useSplitPaymentAutoCalc, type SplitRow } from "@/hooks/useSplitPaymentAutoCalc";
import { PaymentMethodModal, CashPaymentModal } from "@/components/payment";
import { SplitPaymentWizardModal, type SplitPaymentStep } from "@/components/payment/SplitPaymentWizardModal";
import type { PaymentMethod as PaymentMethodType, PaymentAttempt } from "@/types/payment-intent";
import { toast } from "sonner";
import type { Invoice } from "@/data/billing.mock";

interface PaymentSettlementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedBills: Invoice[];
  patientDeposit?: number;
  visitId?: string;
  patientName?: string;
  patientId?: string;
  onPaymentComplete?: () => void;
}

export function PaymentSettlementModal({
  open,
  onOpenChange,
  selectedBills,
  patientDeposit = 320000,
  visitId = "VISIT-001",
  patientName = "Patient",
  patientId = "P001",
  onPaymentComplete,
}: PaymentSettlementModalProps) {
  const [adjustDeposit, setAdjustDeposit] = useState(false);
  const [payerName, setPayerName] = useState("");
  const [payerRelation, setPayerRelation] = useState("self");
  const [payerMobile, setPayerMobile] = useState("");
  const [printReceipt, setPrintReceipt] = useState(true);
  const [sendSms, setSendSms] = useState(false);
  const [sendEmail, setSendEmail] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodType>("card");
  const [showSplitWizard, setShowSplitWizard] = useState(false);
  const [showCashModal, setShowCashModal] = useState(false);

  const totalOriginalAmount = selectedBills.reduce((sum, bill) => sum + bill.originalAmount, 0);
  const totalNetAmount = selectedBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
  const totalPaidAmount = selectedBills.reduce((sum, bill) => sum + bill.paidAmount, 0);
  const totalBalanceAmount = selectedBills.reduce((sum, bill) => sum + bill.balance, 0);

  const amountToCollect = adjustDeposit
    ? Math.max(0, totalBalanceAmount - patientDeposit)
    : totalBalanceAmount;

  const {
    rows: splitRows,
    isValid,
    validationError,
    updateRowAmount,
    updateRowMethod,
    addRow,
    removeRow,
    resetDistribution,
    getCardUpiSteps,
    getAllSteps,
    hasMixedPayment,
  } = useSplitPaymentAutoCalc({ totalDue: amountToCollect / 100 });

  const handlePaymentSuccess = (attempt: PaymentAttempt) => {
    setShowPaymentModal(false);
    toast.success("Payment collected successfully!", {
      description: `Transaction ID: ${attempt.providerTxnId || attempt.id}`,
    });
    onPaymentComplete?.();
    onOpenChange(false);
  };

  const handleSplitWizardComplete = (steps: SplitPaymentStep[]) => {
    const cardAmount = steps.filter(s => s.method === 'card' && s.status === 'succeeded')
      .reduce((sum, s) => sum + s.amount, 0);
    const upiAmount = steps.filter(s => s.method === 'upi' && s.status === 'succeeded')
      .reduce((sum, s) => sum + s.amount, 0);
    
    toast.success("Split payment collected successfully!", {
      description: `Card: ${formatINR(cardAmount)} + UPI: ${formatINR(upiAmount)}`,
    });
    onPaymentComplete?.();
    onOpenChange(false);
  };

  const handleCollectPayment = () => {
    if (!isValid) {
      toast.error(validationError || "Please check split amounts");
      return;
    }

    if (splitRows.length === 1 && splitRows[0].method === "cash") {
      setShowCashModal(true);
      return;
    }

    if (splitRows.length === 1 && (splitRows[0].method === "card" || splitRows[0].method === "upi")) {
      setSelectedPaymentMethod(splitRows[0].method);
      setShowPaymentModal(true);
      return;
    }

    if (hasMixedPayment() || getCardUpiSteps().length > 0) {
      setShowSplitWizard(true);
    } else {
      setShowCashModal(true);
    }
  };

  const handleCashSuccess = () => {
    setShowCashModal(false);
    toast.success("Cash payment collected successfully!");
    onPaymentComplete?.();
    onOpenChange(false);
  };

  const wizardSteps: SplitPaymentStep[] = hasMixedPayment() 
    ? getAllSteps().map(step => ({ ...step, status: 'pending' as const }))
    : getCardUpiSteps().map(step => ({ ...step, status: 'pending' as const }));

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl min-h-[520px] p-0 gap-0 border-0 flex flex-col">
          {/* Header */}
          <div className="bg-primary px-6 h-20 flex flex-col justify-center rounded-t-lg">
            <h2 className="text-base font-semibold text-white">Payment Settlement</h2>
            <p className="text-sm text-white/80 mt-0.5">
              {selectedBills.length === 1
                ? `Invoice: ${selectedBills[0].invoiceNo}`
                : `${selectedBills.length} Invoices Selected`}
            </p>
          </div>

          {/* Horizontal Layout Content */}
          <div className="flex divide-x divide-border flex-1">
            {/* Left Section - Bill Summary */}
            <div className="flex-1 p-6 flex flex-col">
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Gross Bill Amount</span>
                  <span className="text-sm text-foreground">{formatINR(totalOriginalAmount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Discount Applied</span>
                  <span className="text-sm text-emerald-600">- {formatINR(totalOriginalAmount - totalNetAmount)}</span>
                </div>
                <div className="border-t border-border my-2" />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Net Bill Amount</span>
                  <span className="text-sm font-medium text-primary">{formatINR(totalNetAmount)}</span>
                </div>
                {totalPaidAmount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Already Paid</span>
                    <span className="text-sm text-emerald-600">- {formatINR(totalPaidAmount)}</span>
                  </div>
                )}
              </div>

              <div className="bg-muted/30 rounded-lg p-4 border border-border mt-4">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-xs text-muted-foreground">Patient Deposit</span>
                  </div>
                  <span className="text-sm font-medium text-emerald-600">{formatINR(patientDeposit)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Switch id="adjust-deposit-modal" checked={adjustDeposit} onCheckedChange={setAdjustDeposit} />
                  <Label htmlFor="adjust-deposit-modal" className="text-xs text-muted-foreground cursor-pointer">
                    Adjust deposit against this bill
                  </Label>
                </div>

                {adjustDeposit && (
                  <div className="mt-4 pt-4 border-t border-border space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Deposit Used</span>
                      <span className="text-sm text-red-600">
                        - {formatINR(Math.min(patientDeposit, totalBalanceAmount))}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Remaining Deposit</span>
                      <span className="text-sm text-foreground">
                        {formatINR(Math.max(0, patientDeposit - totalBalanceAmount))}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mt-auto">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Amount to Collect</span>
                  <span className="text-lg font-semibold text-primary">{formatINR(amountToCollect)}</span>
                </div>
              </div>
            </div>

            {/* Middle Section - Split Payment */}
            <div className="flex-1 p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium">Split Payment</span>
                <button
                  onClick={resetDistribution}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              </div>

              <div className="space-y-3">
                {splitRows.map((row) => (
                  <div key={row.id} className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">₹</span>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={row.amount || ""}
                        onChange={(e) => updateRowAmount(row.id, parseFloat(e.target.value) || 0)}
                        className="pl-7 h-9"
                        min={0}
                      />
                    </div>

                    <Select 
                      value={row.method} 
                      onValueChange={(value) => updateRowMethod(row.id, value as SplitRow['method'])}
                    >
                      <SelectTrigger className={`w-[120px] h-9 ${row.method === "card" || row.method === "upi" ? "border-primary bg-primary/5" : ""}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                        <SelectItem value="upi">UPI</SelectItem>
                      </SelectContent>
                    </Select>

                    {splitRows.length > 1 && (
                      <button 
                        className="h-9 w-9 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center shrink-0" 
                        onClick={() => removeRow(row.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    )}
                  </div>
                ))}

                {validationError && (
                  <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    {validationError}
                  </div>
                )}

                <button 
                  onClick={addRow}
                  className="text-xs text-primary hover:underline flex items-center gap-1.5"
                >
                  <Plus className="h-4 w-4" />
                  Add Split Payment
                </button>
              </div>

              <div className="space-y-3 pt-4 border-t border-border mt-auto">
                <span className="text-sm font-medium">Payer Details</span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Name</Label>
                    <Input placeholder="Payer name" value={payerName} onChange={(e) => setPayerName(e.target.value)} className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Relation</Label>
                    <Select value={payerRelation} onValueChange={setPayerRelation}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="self">Self</SelectItem>
                        <SelectItem value="spouse">Spouse</SelectItem>
                        <SelectItem value="parent">Parent</SelectItem>
                        <SelectItem value="child">Child</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Mobile Number</Label>
                  <Input placeholder="+91" value={payerMobile} onChange={(e) => setPayerMobile(e.target.value)} className="h-9 text-sm" />
                </div>
              </div>
            </div>

            {/* Right Section - After Payment & Actions */}
            <div className="w-[220px] p-6 flex flex-col">
              <div className="space-y-3 flex-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wide">After Payment</span>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Checkbox id="print-modal" checked={printReceipt} onCheckedChange={(checked) => setPrintReceipt(!!checked)} />
                    <Label htmlFor="print-modal" className="text-sm cursor-pointer">Print Receipt</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="sms-modal" checked={sendSms} onCheckedChange={(checked) => setSendSms(!!checked)} />
                    <Label htmlFor="sms-modal" className="text-sm cursor-pointer">SMS</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="email-modal" checked={sendEmail} onCheckedChange={(checked) => setSendEmail(!!checked)} />
                    <Label htmlFor="email-modal" className="text-sm cursor-pointer">Email</Label>
                  </div>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <Button
                  className="w-full h-10"
                  disabled={amountToCollect === 0}
                  onClick={handleCollectPayment}
                >
                  Collect Payment
                </Button>
                <p className="text-[10px] text-center text-muted-foreground leading-relaxed">
                  By settling this bill, you confirm that payment has been received. 
                  A receipt will be generated automatically.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      <PaymentMethodModal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        patientId={patientId}
        patientName={patientName}
        mrn={visitId}
        orderId={selectedBills[0]?.invoiceNo || `INV-${Date.now()}`}
        amount={amountToCollect}
        purpose="settlement"
        defaultMethod={selectedPaymentMethod}
        onSuccess={handlePaymentSuccess}
        onCancel={() => setShowPaymentModal(false)}
      />

      {/* Split Payment Wizard Modal */}
      <SplitPaymentWizardModal
        open={showSplitWizard}
        onOpenChange={setShowSplitWizard}
        patientId={patientId}
        patientName={patientName}
        mrn={visitId}
        orderId={selectedBills[0]?.invoiceNo || `INV-${Date.now()}`}
        totalAmount={amountToCollect}
        purpose="settlement"
        steps={wizardSteps}
        onComplete={handleSplitWizardComplete}
        onCancel={() => setShowSplitWizard(false)}
      />

      {/* Cash Payment Modal */}
      <CashPaymentModal
        open={showCashModal}
        onOpenChange={setShowCashModal}
        patientName={patientName}
        mrn={visitId}
        amount={amountToCollect}
        purpose="settlement"
        onSuccess={handleCashSuccess}
        onCancel={() => setShowCashModal(false)}
      />
    </>
  );
}
