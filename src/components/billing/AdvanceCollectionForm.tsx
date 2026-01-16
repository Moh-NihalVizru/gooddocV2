import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaymentLine } from "@/types/billing";
import { formatINR } from "@/utils/currency";
import { Plus, X } from "lucide-react";

interface AdvanceCollectionFormProps {
  onConfirmAdvance: (data: {
    payerName: string;
    reason: string;
    paymentLines: PaymentLine[];
  }) => void;
}

export function AdvanceCollectionForm({ onConfirmAdvance }: AdvanceCollectionFormProps) {
  const [payerName, setPayerName] = useState("Fredrick John");
  const [reason, setReason] = useState("Admission");
  const [paymentLines, setPaymentLines] = useState<PaymentLine[]>([
    { id: 1, method: "cash", amount: 0, refs: {} },
  ]);

  const totalAmount = paymentLines.reduce((sum, line) => sum + line.amount, 0);

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
    if (!payerName.trim() || totalAmount <= 0) return;
    
    onConfirmAdvance({
      payerName,
      reason,
      paymentLines,
    });

    // Reset form
    setPaymentLines([{ id: 1, method: "cash", amount: 0, refs: {} }]);
  };

  const canConfirm = payerName.trim() !== "" && totalAmount > 0;

  return (
    <Card className="p-6 space-y-6">
      <h2 className="text-lg font-semibold">Collect Advance</h2>

      {/* Payer Name */}
      <div className="space-y-2">
        <Label htmlFor="advance-payer-name">Payer Name</Label>
        <Input
          id="advance-payer-name"
          value={payerName}
          onChange={(e) => setPayerName(e.target.value)}
          placeholder="Enter payer name"
          required
        />
      </div>

      {/* Reason */}
      <div className="space-y-2">
        <Label htmlFor="advance-reason">Reason</Label>
        <Select value={reason} onValueChange={setReason}>
          <SelectTrigger id="advance-reason">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Admission">Admission</SelectItem>
            <SelectItem value="Procedure">Procedure</SelectItem>
            <SelectItem value="OPD">OPD</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payment Lines */}
      <div className="space-y-3">
        <Label>Payment Method</Label>
        {paymentLines.map((line) => (
          <div key={line.id} className="flex items-center gap-2">
            <div className="flex-1">
              <Input
                type="number"
                value={line.amount}
                onChange={(e) =>
                  updatePaymentLine(line.id, { amount: parseInt(e.target.value) || 0 })
                }
                placeholder="Amount"
                min={0}
              />
            </div>
            <Select
              value={line.method}
              onValueChange={(value) =>
                updatePaymentLine(line.id, { method: value as any })
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {paymentLines.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removePaymentLine(line.id)}
                className="h-10 w-10"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={addPaymentLine}
          className="w-full gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Payment
        </Button>
      </div>

      {/* Total */}
      <div className="flex justify-between items-center py-3 border-t">
        <span className="font-semibold">Total Advance</span>
        <span className="text-xl font-bold text-primary">{formatINR(totalAmount)}</span>
      </div>

      {/* Confirm Button */}
      <Button
        onClick={handleConfirm}
        disabled={!canConfirm}
        className="w-full"
        size="lg"
      >
        Confirm Advance
      </Button>
    </Card>
  );
}
