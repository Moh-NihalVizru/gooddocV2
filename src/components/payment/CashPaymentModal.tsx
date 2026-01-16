import { useState } from 'react';
import { Banknote, CheckCircle2, Printer, Mail, MessageSquare } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { formatINR } from '@/utils/currency';
import type { PaymentPurpose } from '@/types/payment-intent';

interface CashPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientName: string;
  mrn: string;
  amount: number; // in paise
  purpose: PaymentPurpose;
  onSuccess: () => void;
  onCancel?: () => void;
}

export function CashPaymentModal({
  open,
  onOpenChange,
  patientName,
  mrn,
  amount,
  purpose,
  onSuccess,
  onCancel,
}: CashPaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [printReceipt, setPrintReceipt] = useState(true);
  const [sendSMS, setSendSMS] = useState(true);
  const [sendEmail, setSendEmail] = useState(false);

  const handleConfirm = () => {
    setIsProcessing(true);
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsComplete(true);
    }, 1500);
  };

  const handleDone = () => {
    setIsComplete(false);
    onSuccess();
    onOpenChange(false);
  };

  const handleClose = () => {
    if (!isProcessing) {
      setIsComplete(false);
      onCancel?.();
      onOpenChange(false);
    }
  };

  const getPurposeLabel = (purpose: PaymentPurpose) => {
    switch (purpose) {
      case 'settlement': return 'Bill Settlement';
      case 'advance': return 'Advance Collection';
      case 'dues': return 'Dues Payment';
      case 'refund': return 'Refund';
      default: return 'Payment';
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Banknote className="w-5 h-5 text-primary" />
            Cash Payment
          </DialogTitle>
        </DialogHeader>

        {/* Context summary */}
        <div className="px-6 pb-4">
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-foreground">{patientName}</p>
                <p className="text-xs text-muted-foreground">MRN: {mrn}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-foreground">{formatINR(amount)}</p>
                <p className="text-xs text-muted-foreground">{getPurposeLabel(purpose)}</p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Content */}
        <div className="px-6 py-6">
          {!isComplete ? (
            <div className="space-y-6">
              {/* Amount to collect */}
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-2">Collect Cash Amount</p>
                <p className="text-4xl font-bold text-foreground">{formatINR(amount)}</p>
              </div>

              {/* Receipt options */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">After Collection</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="print-receipt"
                      checked={printReceipt}
                      onCheckedChange={(checked) => setPrintReceipt(checked as boolean)}
                    />
                    <Label htmlFor="print-receipt" className="text-sm cursor-pointer flex items-center gap-2">
                      <Printer className="w-4 h-4 text-muted-foreground" />
                      Print Receipt
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="send-sms"
                      checked={sendSMS}
                      onCheckedChange={(checked) => setSendSMS(checked as boolean)}
                    />
                    <Label htmlFor="send-sms" className="text-sm cursor-pointer flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-muted-foreground" />
                      Send SMS
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="send-email"
                      checked={sendEmail}
                      onCheckedChange={(checked) => setSendEmail(checked as boolean)}
                    />
                    <Label htmlFor="send-email" className="text-sm cursor-pointer flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      Send Email
                    </Label>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={isProcessing}
                  className="flex-1 gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Confirm Payment'
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Success state */}
              <div className="flex flex-col items-center py-4 gap-3">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-foreground">Payment Collected</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Cash payment of {formatINR(amount)} received successfully
                  </p>
                </div>
              </div>

              {/* Receipt info */}
              <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Patient</span>
                  <span className="font-medium">{patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-bold text-emerald-600">{formatINR(amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Method</span>
                  <span className="font-medium">Cash</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span>{new Date().toLocaleTimeString()}</span>
                </div>
              </div>

              {/* Done button */}
              <Button onClick={handleDone} className="w-full">
                Done
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
