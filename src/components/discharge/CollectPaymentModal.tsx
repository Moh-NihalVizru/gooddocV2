import { useState } from "react";
import { CreditCard, X, Banknote, Smartphone, Building2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PendingBill, PaymentMethod } from "@/types/discharge-flow";
import { formatINR } from "@/utils/currency";

interface CollectPaymentModalProps {
  bill: PendingBill;
  onClose: () => void;
  onPaymentComplete: (billNumber: string, amount: number) => void;
}

const paymentMethods: { value: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { value: "cash", label: "Cash", icon: <Banknote className="w-4 h-4" /> },
  { value: "card", label: "Card", icon: <CreditCard className="w-4 h-4" /> },
  { value: "upi", label: "UPI", icon: <Smartphone className="w-4 h-4" /> },
  { value: "neft", label: "NEFT/RTGS", icon: <Building2 className="w-4 h-4" /> },
  { value: "cheque", label: "Cheque", icon: <FileText className="w-4 h-4" /> },
];

const formatCurrency = (amount: number) => formatINR(amount * 100);

export default function CollectPaymentModal({
  bill,
  onClose,
  onPaymentComplete,
}: CollectPaymentModalProps) {
  const [amount, setAmount] = useState(bill.outstandingAmount.toString());
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [reference, setReference] = useState("");
  const [remarks, setRemarks] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const amountNum = parseFloat(amount) || 0;
  const isValidAmount = amountNum > 0 && amountNum <= bill.outstandingAmount;

  const handleSubmit = () => {
    if (!isValidAmount) return;
    setIsProcessing(true);
    
    // Simulate processing
    setTimeout(() => {
      onPaymentComplete(bill.billNumber, amountNum);
      setIsProcessing(false);
    }, 1000);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Collect Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Bill Summary */}
          <div className="bg-muted/30 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Bill Number</span>
              <span className="font-medium">{bill.billNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Bill</span>
              <span className="font-medium">{formatCurrency(bill.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Already Paid</span>
              <span className="text-green-600">{formatCurrency(bill.paidAmount)}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold pt-2 border-t">
              <span>Outstanding</span>
              <span className="text-amber-600">{formatCurrency(bill.outstandingAmount)}</span>
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label>Amount to Collect</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-7"
                max={bill.outstandingAmount}
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAmount(bill.outstandingAmount.toString())}
              >
                Full Amount
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAmount((bill.outstandingAmount / 2).toString())}
              >
                50%
              </Button>
            </div>
            {amountNum > bill.outstandingAmount && (
              <p className="text-sm text-destructive">Amount cannot exceed outstanding balance</p>
            )}
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label>Payment Method</Label>
            <div className="grid grid-cols-5 gap-2">
              {paymentMethods.map((pm) => (
                <button
                  key={pm.value}
                  type="button"
                  onClick={() => setMethod(pm.value)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors ${
                    method === pm.value
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {pm.icon}
                  <span className="text-xs">{pm.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Reference */}
          {method !== "cash" && (
            <div className="space-y-2">
              <Label>Reference / Transaction ID</Label>
              <Input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder={
                  method === "upi" ? "UPI Ref No." :
                  method === "card" ? "Last 4 digits / Auth code" :
                  method === "neft" ? "UTR Number" :
                  "Cheque Number"
                }
              />
            </div>
          )}

          {/* Remarks */}
          <div className="space-y-2">
            <Label>Remarks (Optional)</Label>
            <Textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add any notes..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValidAmount || isProcessing}>
            {isProcessing ? "Processing..." : `Collect ${formatCurrency(amountNum)}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
