import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Invoice, PaymentLine } from "@/types/billing";
import { formatINR } from "@/utils/currency";
import { Trash2 } from "lucide-react";

interface PaymentSummaryPanelProps {
  selectedInvoices: Invoice[];
  advanceBalance: number;
  onConfirmPayment: (paymentData: {
    payerName: string;
    appliedAdvance: number;
    paymentLines: PaymentLine[];
    allowPartial: boolean;
  }) => void;
  onClearSelection: () => void;
}

export function PaymentSummaryPanel({
  selectedInvoices,
  advanceBalance,
  onConfirmPayment,
  onClearSelection,
}: PaymentSummaryPanelProps) {
  const [useAdvance, setUseAdvance] = useState(false);
  const [appliedAdvance, setAppliedAdvance] = useState(0);
  const [payerName, setPayerName] = useState("Harish Kalyan");
  const [payerRelation, setPayerRelation] = useState("self");
  const [payerMobile, setPayerMobile] = useState("+91 98765 43210");
  const [paymentLines, setPaymentLines] = useState<PaymentLine[]>([
    { id: 1, method: "cash", amount: 0, refs: {} },
  ]);
  const [printReceipt, setPrintReceipt] = useState(true);
  const [sendSms, setSendSms] = useState(true);
  const [sendEmail, setSendEmail] = useState(false);

  const subtotal = selectedInvoices.reduce((sum, inv) => sum + inv.balance, 0);
  const maxAdvance = Math.min(advanceBalance, subtotal);
  const netPayable = subtotal - appliedAdvance;
  const totalPayments = paymentLines.reduce((sum, line) => sum + line.amount, 0);
  const remaining = netPayable - totalPayments;

  const handleUseAdvanceToggle = (checked: boolean) => {
    setUseAdvance(checked);
    if (checked) {
      setAppliedAdvance(maxAdvance);
      updateFirstPaymentAmount(subtotal - maxAdvance);
    } else {
      setAppliedAdvance(0);
      updateFirstPaymentAmount(subtotal);
    }
  };

  const updateFirstPaymentAmount = (amount: number) => {
    setPaymentLines((prev) => [
      { ...prev[0], amount },
      ...prev.slice(1),
    ]);
  };

  const addPaymentLine = () => {
    const newId = Math.max(...paymentLines.map((l) => l.id)) + 1;
    setPaymentLines([...paymentLines, { id: newId, method: "cash", amount: 0, refs: {} }]);
  };

  const removePaymentLine = (id: number) => {
    if (paymentLines.length > 1) {
      setPaymentLines(paymentLines.filter((line) => line.id !== id));
    }
  };

  const updatePaymentLine = (id: number, updates: Partial<PaymentLine>) => {
    setPaymentLines(
      paymentLines.map((line) => (line.id === id ? { ...line, ...updates } : line))
    );
  };

  const handleConfirm = () => {
    if (!payerName.trim()) return;
    
    onConfirmPayment({
      payerName,
      appliedAdvance,
      paymentLines,
      allowPartial: remaining > 0,
    });
  };

  const handlePayLater = () => {
    onConfirmPayment({
      payerName,
      appliedAdvance: 0,
      paymentLines: [],
      allowPartial: true,
    });
  };

  const canConfirm = payerName.trim() !== "" && remaining >= 0;

  if (selectedInvoices.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Select invoices to collect payment
        </p>
      </Card>
    );
  }

  // Get first invoice ID for display
  const invoiceId = selectedInvoices[0]?.id || "INV001";

  return (
    <Card className="overflow-hidden sticky top-6">
      {/* Header */}
      <div className="bg-primary px-5 py-4">
        <h3 className="text-base font-semibold text-primary-foreground">Payment Settlement</h3>
        <p className="text-xs text-primary-foreground/70 mt-0.5">
          {selectedInvoices.length === 1 
            ? `Invoice: ${invoiceId}` 
            : `${selectedInvoices.length} Invoices Selected`}
        </p>
      </div>
      
      <div className="p-5 space-y-5">
        {/* Bill Summary */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Gross Bill Amount</span>
            <span className="font-medium">{formatINR(subtotal)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Discount Applied</span>
            <span className="font-medium text-green-600">- ₹0.00</span>
          </div>
          <div className="flex justify-between items-center text-sm border-t border-dashed border-border pt-3">
            <span className="font-semibold">Net Bill Amount</span>
            <span className="font-bold text-lg">{formatINR(subtotal)}</span>
          </div>
        </div>

        {/* Advance/Deposit Section */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-sm font-medium">Patient Deposit</span>
            </div>
            <span className="text-sm font-semibold text-blue-600">{formatINR(advanceBalance)}</span>
          </div>
          
          <div className="flex items-center gap-3 pt-1">
            <Switch
              id="use-advance"
              checked={useAdvance}
              onCheckedChange={handleUseAdvanceToggle}
            />
            <Label htmlFor="use-advance" className="text-xs cursor-pointer text-muted-foreground">
              Adjust deposit against this bill
            </Label>
          </div>
          
          {useAdvance && (
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Deposit Used</span>
                <span className="font-medium text-green-600">- {formatINR(appliedAdvance)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Remaining Deposit</span>
                <span className="font-medium">{formatINR(advanceBalance - appliedAdvance)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Amount Payable */}
        <div className="bg-primary/5 border-2 border-primary/20 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Amount to Collect</p>
              <p className="text-2xl font-bold text-primary mt-1">{formatINR(netPayable)}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary text-lg">₹</span>
            </div>
          </div>
        </div>

        {/* Payment Collection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Payment Collection</p>
            <span className="text-xs text-muted-foreground">Split Payment</span>
          </div>
          
          {paymentLines.map((line, index) => (
            <div key={line.id} className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₹</span>
                  <Input
                    type="number"
                    value={line.amount || ""}
                    onChange={(e) =>
                      updatePaymentLine(line.id, { amount: parseInt(e.target.value) || 0 })
                    }
                    placeholder="0.00"
                    className="pl-7 h-11"
                    min={0}
                  />
                </div>
                <Select
                  value={line.method}
                  onValueChange={(value) =>
                    updatePaymentLine(line.id, { method: value as any })
                  }
                >
                  <SelectTrigger className="w-[130px] h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border shadow-lg z-50">
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="neft">NEFT/RTGS</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                  </SelectContent>
                </Select>
                {paymentLines.length > 1 && (
                  <button
                    onClick={() => removePaymentLine(line.id)}
                    className="h-11 w-11 flex items-center justify-center text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              {index === 0 && line.method === "upi" && (
                <Input
                  type="text"
                  placeholder="UPI Transaction ID"
                  className="h-9 text-xs bg-muted/50"
                />
              )}
              {index === 0 && line.method === "card" && (
                <Input
                  type="text"
                  placeholder="Last 4 digits of card / Approval code"
                  className="h-9 text-xs bg-muted/50"
                />
              )}
            </div>
          ))}

          <button 
            className="text-sm text-primary font-medium hover:underline flex items-center gap-1"
            onClick={addPaymentLine}
          >
            <span className="text-lg leading-none">+</span> Add Split Payment
          </button>
        </div>

        {/* Payer Details */}
        <div className="space-y-3 pt-2 border-t border-border">
          <p className="text-sm font-semibold">Payer Details</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Payer Name</Label>
              <Input
                value={payerName}
                onChange={(e) => setPayerName(e.target.value)}
                className="h-10 mt-1"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Relation</Label>
              <Select value={payerRelation} onValueChange={setPayerRelation}>
                <SelectTrigger className="h-10 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border shadow-lg z-50">
                  <SelectItem value="self">Self</SelectItem>
                  <SelectItem value="spouse">Spouse</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="child">Child</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Mobile Number</Label>
            <Input
              type="tel"
              value={payerMobile}
              onChange={(e) => setPayerMobile(e.target.value)}
              className="h-10 mt-1"
            />
          </div>
        </div>

        {/* Receipt Options */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              className="rounded" 
              checked={printReceipt}
              onChange={(e) => setPrintReceipt(e.target.checked)}
            />
            <span>Print Receipt</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              className="rounded" 
              checked={sendSms}
              onChange={(e) => setSendSms(e.target.checked)}
            />
            <span>Send SMS</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              className="rounded" 
              checked={sendEmail}
              onChange={(e) => setSendEmail(e.target.checked)}
            />
            <span>Email</span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-3">
          <Button 
            variant="outline" 
            className="flex-1 h-12" 
            onClick={handlePayLater}
          >
            Pay Later
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="flex-1 h-12 bg-primary hover:bg-primary/90 font-semibold"
          >
            Settle Bill
          </Button>
        </div>

        {/* Footer Note */}
        <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
          By settling this bill, you confirm that payment has been received. 
          A receipt will be generated automatically.
        </p>
      </div>
    </Card>
  );
}
